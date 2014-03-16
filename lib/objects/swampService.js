"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    child_process       = require('child_process'),
    path                = require('path'),
    moment              = require('moment'),
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'swampService',
        singleton: false,
        properties: [
            {
                name: '_createWatcher',
                factoryMethod: 'watcher'
            }
        ],
        inject: ['env', 'utils', 'environmentsManager', 'optionsManager'],
        initMethod: 'initialize'
    },

    constructor: function(service){

        EventDispatcher.call(this);

        this._options = service.options || {};
        this._args = service.args || [];

        this.name = service.name;
        this.description = service.description;
        this.path = service.path;
        this.script = service.script;

        this.pathWatcher = null;
        this.isRunning = false;
        this.process = null;
        this.pid = null;
        this.runRetries = 0;
        this.startTime = null;

        this.serviceParams = service;

    },

    initialize: function() {

        this.utils.mkdir(this._getFolderName());

        this._environments = this._initializeEnvironments(this.serviceParams.enviroments || []);

        this.pathWatcher = this._createWatcher(this.path, this._onWatcherEvent.bind(this));

    },

    start: function(envName) {

        if(!this.isRunning) {

            this.process = child_process.fork(
                path.join(this.path, this.script),
                this._args,
                this._getProcessOptions(envName || this._options.defaultEnv)
            );

            this.pid = this.process.pid;

            this._bindEvents();

            if(this._options.restartOnChange) {
                this.pathWatcher.start();
            }

            this.isRunning = true;

            this.utils.log('[{0}] `{1}` is running'.format(this.pid, this.name), this.utils.LOG_TYPE.SUCCESS);

            this.startTime = new Date();

        }

    },

    stop: function() {
        if(this.isRunning) {

            if(this._options.restartOnChange) {
                this.pathWatcher.stop();
            }

            this.utils.log('[{0}] `{1}` has stopped. (started {2} ago)'.format(this.pid, this.name, this.utils.timeFrom(this.startTime)), this.utils.LOG_TYPE.ERROR);

            if(this.process) {
                this._unbindEvents();

                this.process.kill();

                this.process = null;

                this.pid = null;
            }

            this.isRunning = false;

            this.startTime = null;
        }
    },

    restart: function() {
        this.utils.log('Restarting `{0}`...'.format(this.name), this.utils.LOG_TYPE.INFO);

        this.stop();

        this.start();
    },

    getOption: function(key) {
        return this._options[key] || null;
    },

    _initializeEnvironments: function(envs) {

        var globalEnvs = this.environmentsManager.getAll();

        if(envs.length == 0) {
            return globalEnvs;
        }

        var environments = {};

        _.forEach(envs, function(environment) {

            var env = this.environmentsManager.createMergedEnvironment(environment);

            if(env) {
                this._environments[env.name] = env;
            }

        }.bind(this));

        return environments;
    },

    _onWatcherEvent: function(changelog) {

        this.utils.log('Changes recorded at {0}'.format(this.name));
        _.forEach(changelog, function(change) {
            this.utils.log('{0} has {1}'.format(change.path, change.event));
        }.bind(this));

        this.restart();
    },

    _bindEvents: function() {
        this.process.stdout.on('data', this._onProcessData.bind(this));
        this.process.stderr.on('data', this._onProcessError.bind(this));

        this.process.on('exit', this._onProcessExitWithCode.bind(this));
    },

    _unbindEvents: function() {
        this.process.stdout.removeAllListeners('data');
        this.process.stderr.removeAllListeners('data');

        this.process.removeAllListeners('exit');
    },

    _onProcessError: function(data) {


        this.fireEvent('stderr', this.name, data);
    },

    _onProcessData: function(data) {


        this.fireEvent('stdout', this.name, data);
    },

    _onProcessExitWithCode: function(errorCode) {

        this.stop();

        if(this._options.runForever && errorCode != 0) {

            var needToRun = true;

            if(this._options.maxRetries > -1) {

                if(this.runRetries < this._options.maxRetries) {
                    this.runRetries++;
                    this.utils.log('Service {0} has crashed. running again ({1}/{2})...'.format(this.name, this.runRetries, this._options.maxRetries));
                } else {
                    needToRun = false;
                }

            }

            if(needToRun) {
                this.start();
            } else {

                //we can stop running forever, set retries to 0
                this.runRetries = 0;
            }

        }

        this.fireEvent('exit', this.name, errorCode);
    },

    _getFolderName: function() {
        return this.name.replace(/ /g, '_').toLowerCase();
    },

    _getProcessOptions: function(envName) {
        return {
            cwd: this.path,
            env: this._environments[envName] || {},
            silent: true
        }
    }
});
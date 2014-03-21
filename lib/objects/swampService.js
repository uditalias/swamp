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
            },
            {
                name: '_createLogger',
                factoryMethod: 'swampLogger'
            }
        ],
        inject: ['env', 'utils', 'environmentsManager', 'optionsManager', 'mainLoggers'],
        initMethod: 'initialize'
    },

    constructor: function(service){

        EventDispatcher.call(this);

        this._environments = {};
        this._options = service.options || {};
        this._args = service.args || [];

        this.name = service.name;
        this.description = service.description;
        this.path = service.path;
        this.script = service.script;

        this.pathWatcher = null;
        this.isRunning = false;
        this.runningEnvironment = null;
        this.process = null;
        this.pid = null;
        this.runRetries = 0;
        this.startTime = null;

        this.serviceParams = service;
    },

    initialize: function() {

        this._initializeLoggers();

        this._initializeEnvironments(this.serviceParams.environments || []);

        this.pathWatcher = this._createWatcher(this.path, this._options.restartOnChange, this._onWatcherEvent.bind(this));

    },

    serialize: function() {
        return {
            name: this.name,
            description: this.description,
            path: this.path,
            script: this.script,
            isRunning: this.isRunning,
            runningEnvironment: this.runningEnvironment,
            pid: this.pid,
            startTime: this.startTime,
            options: this._options,
            environments: this._environments
        };
    },

    start: function(envName) {

        if(!this.isRunning) {

            var full_path = path.join(this.path, this.script);

            if(!this.utils.fileExist(full_path)) {
                this.utils.log("`{0}` service path `{1}` doesn't exists.".format(this.name, full_path), this.utils.LOG_TYPE.ERROR, false, false, this.mainLoggers.err);
                return;
            }

            this.runningEnvironment = envName || this._options.defaultEnv;

            this.process = child_process.fork(
                full_path,
                this._args,
                this._getProcessOptions(this.runningEnvironment)
            );

            this.pid = this.process.pid;

            this._bindEvents();

            if(this._options.restartOnChange) {
                this.pathWatcher.start();
            }

            this.isRunning = true;

            this.utils.log('[{0}] `{1}` is running'.format(this.pid, this.name), this.utils.LOG_TYPE.SUCCESS, false, false, this.mainLoggers.out);

            this.startTime = new Date();

        }

    },

    stop: function() {
        if(this.isRunning) {

            if(this._options.restartOnChange) {
                this.pathWatcher.stop();
            }

            this.utils.log('[{0}] `{1}` has stopped. (started {2} ago)'.format(this.pid, this.name, this.utils.timeFrom(this.startTime)), this.utils.LOG_TYPE.ERROR, false, false, this.mainLoggers.err);

            if(this.process) {
                this._unbindEvents();

                this.process.kill();

                this.process = null;

                this.pid = null;
            }

            this.isRunning = false;

            this.runningEnvironment = null;

            this.startTime = null;
        }
    },

    restart: function() {
        this.utils.log('Restarting `{0}`...'.format(this.name), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggers.out);

        this.stop();

        setTimeout(function() {
            this.start();
        }.bind(this), this.env.restartDelay);
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

        this.utils.log('Changes recorded at {0}'.format(this.name), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggers.out);
        _.forEach(changelog, function(change) {
            this.utils.log('{0} has {1}'.format(change.path, change.event), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggers.out);
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

        data = data.toString();

        this._loggers.err.log('error', data);

        this.fireEvent('stderr', this.name, data);
    },

    _onProcessData: function(data) {

        data = data.toString();

        this._loggers.out.log('info', data);

        this.fireEvent('stdout', this.name, data);
    },

    _onProcessExitWithCode: function(errorCode) {

        this.stop();

        if(this._options.runForever && errorCode != 0) {

            var needToRun = true;

            if(this._options.maxRetries > -1) {

                if(this.runRetries < this._options.maxRetries) {
                    this.runRetries++;
                    this.utils.log('Service {0} has crashed. running again ({1}/{2})...'.format(this.name, this.runRetries, this._options.maxRetries), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggers.out);
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

    _initializeLoggers: function() {
        var folderName = this._getFolderName();

        this.utils.mkdir(folderName);
        this.utils.mkfile(folderName + '/out.log', 'w');
        this.utils.mkfile(folderName + '/err.log', 'w');

        this._loggers = {
            out: this._createLogger({ filename: path.resolve(process.cwd(), folderName + '/out.log'), json: false }),
            err: this._createLogger({ filename: path.resolve(process.cwd(), folderName + '/err.log'), json: false })
        }
    },

    _getProcessOptions: function(envName) {

        var env = this._environments[envName] ? this._environments[envName].toJSON() : {};

        return {
            cwd: this.path,
            env: env,
            silent: true
        }
    }
});
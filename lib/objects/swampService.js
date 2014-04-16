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
            },
            {
                name: '_createMonitor',
                factoryMethod: 'monitor'
            }
        ],
        inject: ['env', 'utils', 'environmentsManager', 'optionsManager', 'mainLoggersManager'],
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
        this.command = service.command;

        this._loggers = null;
        this._pathWatcher = null;
        this._monitor = null;
        this._monitorMemory = false;
        this._monitorCpu = false;

        this.isRunning = false;
        this.runningEnvironment = null;
        this.process = null;
        this.pid = null;
        this.runRetries = 0;
        this.startTime = null;

        this.serviceParams = service;
    },

    initialize: function() {

        this._initializeLoggers(this.serviceParams.logs);

        this._initializeEnvironments(this.serviceParams.environments || []);

        this._monitorMemory = this.optionsManager.getOptions().monitor.memory;
        this._monitorCpu = this.optionsManager.getOptions().monitor.cpu;

        if(this._options.restartOnChange) {
            this._pathWatcher = this._createWatcher(this.path, this._options.restartOnChange, this._onWatcherEvent.bind(this));
        }

        if(this._monitorMemory || this._monitorCpu) {
            this._monitor = this._createMonitor(this._monitorMemory, this._monitorCpu);
        }

    },

    serialize: function() {
        return {
            name: this.name,
            description: this.description,
            path: this.path,
            script: this.script,
            command: this.command,
            isRunning: this.isRunning,
            runningEnvironment: this.runningEnvironment,
            pid: this.pid,
            startTime: this.startTime,
            options: this._options,
            environments: this._environments,
            logs: {
                out: this._loggers.out.getAll(),
                err: this._loggers.err.getAll()
            },
            monitor: {
                cpu: this._monitorCpu,
                memory: this._monitorMemory
            }
        };
    },

    start: function(envName) {

        if(!this.isRunning) {

            var full_path = this.command || path.join(this.path, this.script);

            if(!this._validateCommandPath()) {
                return;
            }

            this.pid = this._runProcess(full_path, envName);

            this._bindEvents();

            this.isRunning = true;

            this.utils.log('[{0}] `{1}` is running'.format(this.pid, this.name), this.utils.LOG_TYPE.SUCCESS, false, false, this.mainLoggersManager.getOut());

            this.startTime = new Date();

            if(this._options.restartOnChange) {
                this._pathWatcher.start();
            }

            if(this._monitor) {
                this._monitor.start(this.pid);
            }

            this._fireStartEvent();

        }

    },

    stop: function() {
        if(this.isRunning) {

            if(this._options.restartOnChange) {
                this._pathWatcher.stop();
            }

            this.utils.log('[{0}] `{1}` has stopped. (started {2} ago)'.format(this.pid, this.name, this.utils.timeFrom(this.startTime)), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());

            if(this._monitor) {
                this._monitor.stop();
            }

            if(this.process) {
                this._unbindEvents();

                this.process.kill();
            }

            this._fireStopEvent();

            this.process = null;

            this.pid = null;

            this.isRunning = false;

            this.runningEnvironment = null;

            this.startTime = null;
        }
    },

    restart: function(envName) {
        this.utils.log('Restarting `{0}`...'.format(this.name), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());

        this.stop();

        setTimeout(function() {
            this.start(envName);
        }.bind(this), this.env.restartDelay);

        this.fireEvent('restart', this.name);
    },

    getOption: function(key) {
        return this._options[key] || null;
    },

    _runProcess: function(path, envName) {

        this.runningEnvironment = envName || this._options.defaultEnv;

        var processRunner = this._getProcessRunner();

        this.process = processRunner(
            path,
            this._args,
            this._getProcessOptions(this.runningEnvironment)
        );

        return this.process.pid;

    },

    _getProcessRunner: function() {
        return !!this.command ? child_process.spawn : child_process.fork;
    },

    _validateCommandPath: function() {

        var full_path;

        if(this.command) {
            full_path = this.path;
        } else {
            full_path = path.join(this.path, this.script);
        }

        if(!this.utils.fileExist(full_path)) {
            this.utils.log("`{0}` service path `{1}` doesn't exists.".format(this.name, full_path), this.utils.LOG_TYPE.ERROR, false, false, this.mainLoggersManager.getError());
            return false;
        }

        return true;
    },

    _fireStopEvent: function() {
        this.fireEvent('stop', this.name, {
            name: this.name,
            pid: this.pid,
            startTime: this.startTime
        });
    },

    _fireStartEvent: function() {
        this.fireEvent('start', this.name, {
            name: this.name,
            isRunning: this.isRunning,
            runningEnvironment: this.runningEnvironment,
            pid: this.pid,
            startTime: this.startTime
        });
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

    _onWatcherEvent: function(err, changelog) {

        if(err) {
            this.utils.log('Error listening to service file changes {0}'.format(err.toString()), this.utils.LOG_TYPE.ERROR, false, false, this._loggers.err);
            return;
        }

        this.utils.log('Changes recorded at {0}'.format(this.name), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());

        _.forEach(changelog, function(change) {

            this.utils.log('{0} has {1}'.format(change.path, change.event), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());

        }.bind(this));

        this.restart();
    },

    _bindEvents: function() {
        this.process.stdout.on('data', this._onProcessData.bind(this));
        this.process.stderr.on('data', this._onProcessError.bind(this));

        this.process.on('exit', this._onProcessExitWithCode.bind(this));
        this.process.on('close', this._onProcessClose.bind(this));

        if(this._monitor) {
            this._monitor.on('data', this._onMonitorData, this);
        }
    },

    _unbindEvents: function() {
        this.process.stdout.removeAllListeners('data');
        this.process.stderr.removeAllListeners('data');

        this.process.removeAllListeners('exit');

        if(this._monitor) {
            this._monitor.un('data', this._onMonitorData, this);
        }
    },

    _onProcessClose: function(code, signal) {

    },

    _onProcessError: function(data) {

        data = data.toString();

        var logObj = this._loggers.err.log('error', data);

        this.fireEvent('stderr', this.name, logObj);
    },

    _onProcessData: function(data) {

        data = data.toString();

        var logObj = this._loggers.out.log('info', data);

        this.fireEvent('stdout', this.name, logObj);
    },

    _onProcessExitWithCode: function(errorCode) {

        this.stop();

        if(this._options.runForever && errorCode != 0) {

            var needToRun = true;

            if(this._options.maxRetries > -1) {

                if(this.runRetries < this._options.maxRetries) {
                    this.runRetries++;
                    this.utils.log('Service {0} has crashed. running again ({1}/{2})...'.format(this.name, this.runRetries, this._options.maxRetries), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());
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

    _onMonitorData: function(data) {
        this.fireEvent('monitor', this.name, data);
    },

    _getFolderName: function() {
        return this.name.replace(/[^a-zA-Z0-9]/g,'_').toLowerCase();
    },

    _initializeLoggers: function(logs) {

        var _logFilesPath = this._ensureLogFilesExist(logs);

        this._loggers = {
            out: this._createLogger({ filename: _logFilesPath.out, json: false }, true, this._options.maxLogsToSave),
            err: this._createLogger({ filename: _logFilesPath.err, json: false }, true, this._options.maxLogsToSave)
        }
    },

    _ensureLogFilesExist: function(logs) {

        var folderName = this._getFolderName();

        this._createDefaultLogsFolder(logs);

        var _outLogPath = logs && logs.out ? logs.out : path.resolve(process.cwd(), folderName + '/out.log');
        var _errorLogPath = logs && logs.err ? logs.err : path.resolve(process.cwd(), folderName + '/err.log');

        var _outLogPathDir = path.dirname(_outLogPath);
        var _errorLogPathDir = path.dirname(_errorLogPath);

        this.utils.mkdir(_outLogPathDir);
        this.utils.mkdir(_errorLogPathDir);

        this.utils.mkfile(_outLogPath, 'a');

        this.utils.mkfile(_errorLogPath, 'a');

        return {
            out: _outLogPath,
            err: _errorLogPath
        }
    },

    _createDefaultLogsFolder: function(logs) {

        var _createDefault = true;

        if(logs) {
            if(logs.err && logs.out) {
                _createDefault = false;
            }
        }

        if(_createDefault) {
            var folderName = this._getFolderName();

            this.utils.mkdir(folderName);
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
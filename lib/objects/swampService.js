"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    child_process       = require('child_process'),
    path                = require('path'),
    moment              = require('moment'),
    Q                   = require('q');

module.exports = EventDispatcher.define({

    /*
     *  swampService EventDispatcher
     *  configurations and dependency injection
     */
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
        inject: ['env',
            'utils',
            'environmentsManager',
            'optionsManager',
            'mainLoggersManager',
            'logOptionsParser',
            'userResolverService'],

        initMethod: 'initialize'
    },

    /*
     *  swampService constructor
     */
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

    /*
     *  Swamp service initializer
     *
     *  Initializing the logger files, environments, memory and cpu monitors
     *  and parsing the options configured in the Swampfile
     */
    initialize: function() {

        this._initializeLoggers(this.serviceParams.logs);

        this._environments = this._initializeEnvironments(this.serviceParams.environments || []);

        this._monitorMemory = this.optionsManager.getOptions().monitor.memory;
        this._monitorCpu = this.optionsManager.getOptions().monitor.cpu;

        if(this._monitorMemory || this._monitorCpu) {
            this._monitor = this._createMonitor(this._monitorMemory, this._monitorCpu);
        }

        if(this._options.restartOnChange) {
            this._pathWatcher = this._createWatcher(this.path, this._options.restartOnChange, this._onWatcherEvent.bind(this));
        }
    },

    /*
     *  Serialize this service options for connected dashboard and CLI clients
     */
    serialize: function(includeLogs) {

        var serialized = {
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
            monitor: {
                cpu: this._monitorCpu,
                memory: this._monitorMemory
            }
        };

        if(includeLogs) {
            serialized.logs = {
                out: this._loggers.out.getAll(),
                err: this._loggers.err.getAll()
            }
        }

        return serialized;
    },

    /*
     *  Start this process if not running, bind to the process events and emits
     *  the `start` event
     */
    start: function(envName) {

        if(!this.isRunning) {

            var full_path = this.command || path.join(this.path, this.script);

            if(!this._validateCommandPath()) {
                return;
            }

            this._runProcess(full_path, envName)
                .then(this._onProcessRun.bind(this));
        }
    },

    /*
     *  Stop this running service, killing the running process and unbind all events
     *  and fire the `stop` event for this service.
     *
     *  Returns the total run time of this process for auto run analysis.
     *  see the `_onProcessExitWithCode` listener for more details
     */
    stop: function() {

        var runtime = new Date().getTime() - this.startTime.getTime();

        if(this.isRunning) {

            if(this._options.restartOnChange) {
                this._pathWatcher.stop();
            }

            this.utils.log(this.LOG_TEMPLATES.SERVICE_STOPPED.format(this.pid, this.name, this.utils.timeFrom(this.startTime)),
                this.utils.LOG_TYPE.INFO, false, false, [this.mainLoggersManager.getOut(), this._loggers.out]);

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

        return runtime;
    },

    /*
     *  Restarts this service and emits the `restart` event
     */
    restart: function(envName) {
        this.utils.log(this.LOG_TEMPLATES.RESTART_SERVICE.format(this.name), this.utils.LOG_TYPE.INFO, false, false, [this.mainLoggersManager.getOut(), this._loggers.out]);

        this.stop();

        setTimeout(function() {
            this.start(envName);
        }.bind(this), this.env.restartDelay);

        this.fireEvent('restart', this.name);
    },

    /*
     *  Returns a service option by option key (e.g. `autorun`)
     */
    getOption: function(key) {
        return this._options[key] || null;
    },

    _runProcess: function(path, envName) {

        var self = this;

        var deferred = Q.defer();

        this.runningEnvironment = envName || this._options.defaultEnv;

        var processRunner = this._getProcessRunner();

        this._getProcessOptionsAsync(this.runningEnvironment)
            .then(function(options) {

                self.process = processRunner(
                    path,
                    self._args,
                    options
                );

                self.pid = self.process.pid;

                deferred.resolve();

            });

        return deferred.promise;

    },

    /*
     *  After executing the `_runProcess` method, this method invoked
     *  after resolving the user id and running the process with the
     *  selected options
     */
    _onProcessRun: function() {

        this._bindEvents();

        this.isRunning = true;

        this.utils.log(this.LOG_TEMPLATES.SERVICE_RUNNING.format(this.pid, this.name),
            this.utils.LOG_TYPE.SUCCESS, false, false, [this.mainLoggersManager.getOut(), this._loggers.out]);

        this.startTime = new Date();

        if(this._options.restartOnChange) {
            this._pathWatcher.start();
        }

        if(this._monitor) {
            this._monitor.start(this.pid);
        }

        this._fireStartEvent();

    },

    /*
     *  Returns `child_process.spawn` or `child_process.fork` according to
     *  this service type, fork for node.js services, spawn for other services
     */
    _getProcessRunner: function() {
        return !!this.command ? child_process.spawn : child_process.fork;
    },

    /*
     * Command path validator, logs and error when the path does not exists
     */
    _validateCommandPath: function() {

        var full_path;

        if(this.command) {
            full_path = this.path;
        } else {
            full_path = path.join(this.path, this.script);
        }

        if(!this.utils.fileExist(full_path)) {
            this.utils.log(this.LOG_TEMPLATES.COMMAND_PATH_NOT_FOUND.format(this.name, full_path), this.utils.LOG_TYPE.ERROR, false, false, this.mainLoggersManager.getError());
            return false;
        }

        return true;
    },

    /*
     *  This function emits the `stop` event when this service is started
     */
    _fireStopEvent: function() {
        this.fireEvent('stop', this.name, {
            name: this.name,
            pid: this.pid,
            startTime: this.startTime
        });
    },

    /*
     *  This function emits the `start` event when this service is started
     */
    _fireStartEvent: function() {
        this.fireEvent('start', this.name, {
            name: this.name,
            isRunning: this.isRunning,
            runningEnvironment: this.runningEnvironment,
            pid: this.pid,
            startTime: this.startTime
        });
    },

    /*
     *  Initialize the service environments, this one will merge the service
     *  environments and their variables with the global swamp environments
     */
    _initializeEnvironments: function(envs) {

        var globalEnvs = this.environmentsManager.getAll();

        if(envs.length == 0) {
            return globalEnvs;
        }

        var environments = {};

        _.forEach(envs, function(environment) {

            var env = this.environmentsManager.createMergedEnvironment(environment);

            if(env) {
                environments[env.name] = env;
            }

        }.bind(this));

        _.forEach(globalEnvs, function(globalEnvironment) {

            var globalEnvName = globalEnvironment.name;

            if(!environments[globalEnvName]) {

                var env = this.environmentsManager.createMergedEnvironment({ name: globalEnvName });

                if(env) {
                    environments[env.name] = env;
                }
            }

        }.bind(this));

        return environments;
    },

    /*
     *  The listener function to the file changes watcher of this process
     *  this one listens only it this service `restartOnChange` option is set
     */
    _onWatcherEvent: function(err, changelog) {

        if(err) {
            this.utils.log(this.LOG_TEMPLATES.RESTART_ON_CHANGE_ERROR.format(err.message), this.utils.LOG_TYPE.ERROR, false, false, this._loggers.err);
            this.utils.log(this.LOG_TEMPLATES.RESTART_ON_CHANGE_INFO, this.utils.LOG_TYPE.ERROR, false, false, this._loggers.err);
            this._pathWatcher.stop();
            return;
        }

        this.utils.log(this.LOG_TEMPLATES.WATCHER_CHANGES_RECORDED.format(this.name), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());

        _.forEach(changelog, function(change) {

            this.utils.log(this.LOG_TEMPLATES.WATCHER_FILE_CHANGE.format(change.path, change.event), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());

        }.bind(this));

        this.restart();
    },

    /*
     *  Binding events to the service process when the process starts
     *  listening to the std, exceptions, exit and monitor data
     */
    _bindEvents: function() {
        this.process.stdout.on('data', this._onProcessData.bind(this));
        this.process.stderr.on('data', this._onProcessError.bind(this));
        this.process.on('uncaughtException', this._onProcessError.bind(this));
        this.process.on('error', this._onProcessError.bind(this));

        this.process.on('exit', this._onProcessExitWithCode.bind(this));
        this.process.on('close', this._onProcessClose.bind(this));

        if(this._monitor) {
            this._monitor.on('data', this._onMonitorData, this);
        }
    },

    /*
     *  Unbinding all events from this service process when the
     *  process dies
     */
    _unbindEvents: function() {
        this.process.stdout.removeAllListeners('data');
        this.process.stderr.removeAllListeners('data');

        this.process.removeAllListeners('exit');
        this.process.removeAllListeners('close');
        this.process.removeAllListeners('error');
        this.process.removeAllListeners('uncaughtException');

        if(this._monitor) {
            this._monitor.un('data', this._onMonitorData, this);
        }
    },

    /*
     *  The listener function for the `close` process event
     */
    _onProcessClose: function(code, signal) {

    },

    /*
     *  The listener function for the `stderr` process event
     */
    _onProcessError: function(data) {

        data = data.toString();

        var logObj = this._loggers.err.log('error', data);
    },

    /*
     *  The listener function for the `stdout` process event
     */
    _onProcessData: function(data) {

        data = data.toString();

        var logObj = this._loggers.out.log('info', data);
    },

    /*
     *  When the service process exit with >0 exit code, this
     *  function will check if we should auto run this process
     *  again, we check the `runForever` option with the `maxRetries`
     *  and we check the `minRuntime` before we launch the process again
     */
    _onProcessExitWithCode: function(errorCode) {

        var lastRuntime = this.stop();

        if(this._options.runForever && errorCode != 0) {

            var needToRun = true;

            if(this._options.maxRetries > -1) {

                if(this.runRetries < this._options.maxRetries) {
                    this.runRetries++;
                    this.utils.log(this.LOG_TEMPLATES.SERVICE_CRASH.format(this.name, this.runRetries, this._options.maxRetries), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());
                } else {
                    needToRun = false;
                }

            }

            // check it the process need to run again
            if(needToRun) {

                // checking the minimum runtime for this process
                if(this._options.minRuntime >= 0) {

                    needToRun = lastRuntime >= this._options.minRuntime;

                }

                // if all requirements are good, start the service
                if(needToRun) {

                    this.start();

                }

            } else {

                //we can stop running forever, set retries to 0
                this.runRetries = 0;
            }

        }

        this.fireEvent('exit', this.name, errorCode);
    },

    /*
     *  emits the `monitor` event when monitor data like CPU and
     *  memory data received from the process monitor
     */
    _onMonitorData: function(err, data) {
        if(!err) {
            this.fireEvent('monitor', this.name, data);
        }
    },

    /*
     *  emits the `stdout` event when out logs received from
     *  the child process
     */
    _onServiceOutLogger: function(logData) {
        this.fireEvent('stdout', this.name, logData);
    },

    /*
     *  emits the `stderr` event when error logs received from
     *  the child process
     */
    _onServiceErrLogger: function(logData) {
        this.fireEvent('stderr', this.name, logData);
    },

    /*
     *  Returns the service folder name for service log files
     *  (replacing any space in underscore)
     */
    _getFolderName: function() {
        return this.name.replace(/[^a-zA-Z0-9]/g,'_').toLowerCase();
    },

    /*
     *  Initialize logger files and set the max file
     *  size for log rotations
     */
    _initializeLoggers: function(logs) {

        var _logFilesPath = this._ensureLogFilesExist(logs);
        var _logFilesSize = this.logOptionsParser.getLogFilesSize(logs);

        this._loggers = {
            out: this._createLogger({ filename: _logFilesPath.out, json: false, maxSize: _logFilesSize.out }, true, this._options.maxLogsToSave),
            err: this._createLogger({ filename: _logFilesPath.err, json: false, maxSize: _logFilesSize.err }, true, this._options.maxLogsToSave)
        }

        this._loggers.out.on('log', this._onServiceOutLogger.bind(this));
        this._loggers.err.on('log', this._onServiceErrLogger.bind(this));
    },

    /*
     *  Create logs and logs file at given location
     */
    _ensureLogFilesExist: function(logs) {

        var folderName = this._getFolderName();

        this.logOptionsParser.createDefaultLogsFolder(logs, folderName);

        var _outLogPath = this.logOptionsParser.getLogPath(logs, 'out', folderName);
        var _errorLogPath =  this.logOptionsParser.getLogPath(logs, 'err', folderName);

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

    /*
     *  get the process running options (cwd, env with params and uid)
     */
    _getProcessOptionsAsync: function(envName) {

        var self = this;

        var deferred = Q.defer();

        var env = this._environments[envName] ? this._environments[envName].toJSON() : {};

        var options = {
            cwd: this.path,
            env: env,
            silent: true
        };

        if(this._options.user && this._options.user != process.env['USER']) {

            this.userResolverService.resolveUserIdByUsername(this._options.user)
                .then(function(uid) {
                    if(uid) {
                        options.uid = uid;
                    }

                    deferred.resolve(options);
                })
                .fail(function(err) {

                    self.utils.log(self.LOG_TEMPLATES.USERID_RESOLVE_ERROR.format(self._options.user),
                        self.utils.LOG_TYPE.ERROR, false, false, self._loggers.err);

                    deferred.resolve(options);

                });

        } else {

            deferred.resolve(options);

        }

        return deferred.promise;
    },

    LOG_TEMPLATES: {
        SERVICE_RUNNING: '[{0}] `{1}` is running',
        SERVICE_STOPPED: '[{0}] `{1}` has stopped. (started {2} ago)',
        RESTART_SERVICE: 'Restarting `{0}`...',
        COMMAND_PATH_NOT_FOUND: '`{0}` service path `{1}` doesn\'t exists.',
        RESTART_ON_CHANGE_ERROR: 'Error listening to service file changes {0}',
        RESTART_ON_CHANGE_INFO: 'restartOnChange will not work for this service session, stopping the watcher.',
        WATCHER_CHANGES_RECORDED: 'Changes recorded at {0}',
        WATCHER_FILE_CHANGE: '{0} has {1}',
        SERVICE_CRASH: 'Service {0} has crashed. running again ({1}/{2})...',
        USERID_RESOLVE_ERROR: 'can\'t resolve username `{0}`'
    }
});
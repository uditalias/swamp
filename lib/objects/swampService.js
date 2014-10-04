"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    child_process       = require('child_process'),
    path                = require('path'),
    SERVICE_PHASE       = require('../utils/enums').SERVICE_PHASE,
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
        inject: [
            'env',
            'utils',
            'environmentsManager',
            'optionsManager',
            'mainLoggersManager',
            'logOptionsParser',
            'userResolverService'
        ],
        initMethod: 'initialize'
    },

    /*
     *  swampService constructor
     */
    constructor: function(service){

        EventDispatcher.call(this);

        this._environments = {};
        this._options = service.options || {};
        this._stopSignal = null;
        this._restartGapFactor = 1000;
        this._restartTimer = null;
        this._args = service.args || [];

        this.id = _.guid();
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
        this._isExpectedExit = false;
        this._phase = SERVICE_PHASE.NONE;

        this.isRunning = false;
        this.runningEnvironment = null;
        this.process = null;
        this.pid = null;
        this.runRetries = 0;
        this.runGap = 0;
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

        this._stopSignal = this.env.signalEvents.indexOf(this._options.killSignal) > -1 ? this._options.killSignal : 'SIGTERM';

        this._restartGapFactor = this._options.restartGapFactor || 500;

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
            id: this.id,
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
     *  Override the service environments at runtime
     */
    setEnvironments: function(environments) {

        this._environments = this._initializeEnvironments(environments);

        this.fireEvent('modifyEnvironments', this.name, this._environments);
    },

    /*
     *  Start this process if not running, bind to the process events and emits
     *  the `start` event
     */
    start: function(envName) {

        if(!this.isRunning && this._phase != SERVICE_PHASE.STARTING && this._phase != SERVICE_PHASE.STARTED) {

            this._phase = SERVICE_PHASE.STARTING;

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

        var deferred = Q.defer();

        if(this.isRunning && this._phase != SERVICE_PHASE.STOPPING && this._phase != SERVICE_PHASE.STOPPED) {

            this._phase = SERVICE_PHASE.STOPPING;

            this._isExpectedExit = true;

            this._stopServiceObservers();

            this.utils.log(this.LOG_TEMPLATES.STOPPING_SERVICE.format(this.name), this.utils.LOG_TYPE.INFO,
                false, false, [this.mainLoggersManager.getOut(), this._loggers.out]);

            this.process.on('exit', function(exitCode, signal) {

                this.utils.log(this.LOG_TEMPLATES.SERVICE_STOPPED.format(this.pid, this.name, this.utils.timeFrom(this.startTime)),
                    this.utils.LOG_TYPE.INFO, false, false, [this.mainLoggersManager.getOut(), this._loggers.out]);

                this._afterStopProcessPhase();

                deferred.resolve(true);

            }.bind(this));

            this._killProcess(this._stopSignal);

        } else {

            this._stopServiceObservers();

            this._afterStopClearance();

            this._afterStopProcessPhase();

            deferred.resolve(true);

        }

        return deferred.promise;
    },

    /*
     *  Restarts this service and emits the `restart` event
     */
    restart: function(envName) {
        this.utils.log(this.LOG_TEMPLATES.RESTART_SERVICE.format(this.name), this.utils.LOG_TYPE.INFO,
            false, false, [this.mainLoggersManager.getOut(), this._loggers.out]);

        this.fireEvent('restart', this.name);

        this.stop().then(function() {

            this.start(envName);

        }.bind(this));
    },

    /*
     *  Set the service phase to PENDING
     */
    pending: function() {

        this._phase = SERVICE_PHASE.PENDING;

        this.fireEvent('pending', this.name);
    },

    /*
     *  Returns a service option by option key (e.g. `autorun`)
     */
    getOption: function(key) {
        return this._options[key] || null;
    },

    /*
     *  Get the service phase
     */
    getPhase: function() {
        return this._phase;
    },

    /*
     *  Return the current log files path (err & out)
     */
    getCurrentSTDFilesPath: function() {

        var folderName = this._getFolderName();

        var _outLogPath = this.logOptionsParser.getLogPath(this.serviceParams.logs, 'out', folderName);
        var _errorLogPath =  this.logOptionsParser.getLogPath(this.serviceParams.logs, 'err', folderName);

        return {
            out: _outLogPath,
            err: _errorLogPath
        }

    },

    /*
     *  Kill the current running process by sending end signal
     */
    _killProcess: function(signal) {

        if(this.process) {

            this.process.kill(signal || this._stopSignal);

        }

    },

    /*
     *  Stops the service files watcher and CPU/Memory monitors
     */
    _stopServiceObservers: function() {
        if(this._options.restartOnChange) {
            this._pathWatcher.stop();
        }

        if(this._monitor) {
            this._monitor.stop();
        }
    },

    /*
     *  This function will be called after the process is actually stopped
     *  and the process is killed
     */
    _afterStopProcessPhase: function() {

        this._unbindEvents();

        this._fireStopEvent();

        this.process = null;

        this.pid = null;

        this.isRunning = false;

        this._phase = SERVICE_PHASE.STOPPED;

        this.runningEnvironment = null;

        this.startTime = null;
    },

    /*
     *  Actually run the process, load the process arguments
     *  and fork/spawm it
     */
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

                if(self._options.waitForReady) {
                    self.process.on('message', self._onProcessReady.bind(self));
                }

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

        this._phase = SERVICE_PHASE.STARTED;

        this.startTime = new Date();

        if(this._options.restartOnChange) {
            this._pathWatcher.start();
        }

        if(this._monitor) {
            this._monitor.start(this.pid);
        }

        if(!this._options.waitForReady) {
            this._fireStartEvent();
        }

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

        this.utils.log(this.LOG_TEMPLATES.SERVICE_RUNNING.format(this.pid, this.name),
            this.utils.LOG_TYPE.SUCCESS, false, false, [this.mainLoggersManager.getOut(), this._loggers.out]);
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

        this.utils.log(this.LOG_TEMPLATES.WATCHER_CHANGES_RECORDED.format(this.name), this.utils.LOG_TYPE.INFO, false, false, [this.mainLoggersManager.getOut(), this._loggers.out]);

        _.forEach(changelog, function(change) {

            this.utils.log(this.LOG_TEMPLATES.WATCHER_FILE_CHANGE.format(change.path, change.event), this.utils.LOG_TYPE.INFO, false, false, [this.mainLoggersManager.getOut(), this._loggers.out]);

        }.bind(this));

        this.restart();
    },

    /*
     *  Binding events to the service process when the process starts
     *  listening to the std, exceptions, exit and monitor data
     */
    _bindEvents: function() {
        this.process.stdout.on('data', this._onProcessDataOut.bind(this));
        this.process.stderr.on('data', this._onProcessErrorOut.bind(this));

        this.process.on('exit', this._onProcessExitWithCode.bind(this));
        this.process.on('close', this._onProcessClose.bind(this));
        this.process.on('error', this._onProcessError.bind(this));
        this.process.on('uncaughtException', this._onProcessError.bind(this));

        if(this._monitor) {
            this._monitor.on('data', this._onMonitorData, this);
        }
    },

    /*
     *  Unbinding all events from this service process when the
     *  process dies
     */
    _unbindEvents: function() {
        if(this.process) {
            this.process.stdout.removeAllListeners('data');
            this.process.stderr.removeAllListeners('data');

            this.process.removeAllListeners('exit');
            this.process.removeAllListeners('close');
            this.process.removeAllListeners('error');
            this.process.removeAllListeners('uncaughtException');
        }

        if(this._monitor) {
            this._monitor.un('data', this._onMonitorData, this);
        }
    },

    /*
     *  The listener function for the `close` process event
     */
    _onProcessClose: function(code, signal) {

        console.log('process close event', code, signal, this.name);

        this.stop();

    },

    /*
     *  The listener function for the `error` process event
     */
    _onProcessError: function(err) {

        console.log('process error event', err, this.name);

        this.stop();

    },

    /*
     *  The listener function for the `stderr` process event
     */
    _onProcessErrorOut: function(data) {

        data = data.toString();

        var logObj = this._loggers.err.log('error', data);
    },

    /*
     *  The listener function for the `stdout` process event
     */
    _onProcessDataOut: function(data) {

        data = data.toString();

        var logObj = this._loggers.out.log('info', data);
    },


    /*
     *  Emit the start event if the process option `waitForReady` is set to `true`
     */
    _onProcessReady: function(msg) {
        if(msg && msg.swamp == 'ready') {
            if(this._options.waitForReady) {
                this.process.removeAllListeners('ready');
            }

            this._fireStartEvent();
        }

    },

    /*
     *  When the service process exit with >0 exit code, this
     *  function will check if we should auto run this process
     *  again, we check the `runForever` option with the `maxRetries`
     *  and we check the `minRuntime` before we launch the process again
     */
    _onProcessExitWithCode: function(exitCode, signal) {

        // check if the exit is expected (e.g. by the user) or the process crashed.
        // if this is an expected exit, the stop phase handled in the `stop` function
        if(this._isExpectedExit) {
            this._isExpectedExit = false;
            this._afterStopClearance();
            return;
        }

        var lastRuntime = new Date().getTime() - this.startTime.getTime();

        this._stopServiceObservers();
        this._afterStopProcessPhase();

        if(this._options.runForever && exitCode != 0) {

            this.utils.log(this.LOG_TEMPLATES.SERVICE_CRASH.format(this.name, exitCode, signal),
                this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());

            var needToRun = true;

            if(this._options.maxRetries > -1) {

                if(this.runRetries < this._options.maxRetries) {

                    this.runRetries++;

                    this.utils.log(this.LOG_TEMPLATES.SERVICE_RUN_RETRY.format(this.name, this.runRetries, this._options.maxRetries),
                        this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());

                } else {

                    needToRun = false;

                }

            }

            // check it the process need to run again
            if(needToRun) {

                // checking the minimum runtime for this process
                if(this._options.minRuntime >= 0) {

                    needToRun = lastRuntime >= this._options.minRuntime;

                    if(!needToRun) {

                        this.utils.log(this.LOG_TEMPLATES.SERVICE_CRASH_TOO_QUICKLY.format(this.name, lastRuntime),
                            this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());

                        this._afterStopClearance();

                    }

                }

                // if all requirements are good, start the service
                if(needToRun) {

                    this._restartTimer = setTimeout(function() {

                        this.runGap += this._restartGapFactor;

                        this.start();

                        this._restartTimer = null;

                    }.bind(this), this.runGap);

                }

            } else {

                this._afterStopClearance();
            }

        }

        this.fireEvent('exit', this.name, exitCode);
    },

    /*
     *  clear run parameters after service stop
     */
    _afterStopClearance: function() {

        //cancel any future restart by the restart gap factor
        clearTimeout(this._restartTimer);
        this._restartTimer = null;

        //reset run parameters
        this.runRetries = 0;
        this.runGap = 0;
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
            silent: true,
            stdio: ['ipc']
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
        SERVICE_STOPPED: '[{0}] `{1}` has stopped. (started {2})',
        RESTART_SERVICE: 'Restarting `{0}`...',
        COMMAND_PATH_NOT_FOUND: '`{0}` service path `{1}` doesn\'t exists.',
        RESTART_ON_CHANGE_ERROR: 'Error listening to service file changes {0}',
        RESTART_ON_CHANGE_INFO: 'restartOnChange will not work for this service session, stopping the watcher.',
        WATCHER_CHANGES_RECORDED: 'Changes recorded at {0}',
        WATCHER_FILE_CHANGE: '{0} has {1}',
        SERVICE_RUN_RETRY: 'Running `{0}` again ({1}/{2})...',
        SERVICE_CRASH: 'Service `{0}` has exited with code: {1}, signal: {2}',
        SERVICE_CRASH_TOO_QUICKLY: 'Service `{0}` has exited too quickly ({1}ms)',
        STOPPING_SERVICE: 'Stopping `{0}`...',
        USERID_RESOLVE_ERROR: 'Can\'t resolve username `{0}`',
        NODE_PROCESS_CLOSE_EVENT: '',
        NODE_PROCESS_ERROR_EVENT: ''
    }
});
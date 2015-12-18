"use strict";
var appolo = require('appolo-express'),
    EventDispatcher = appolo.EventDispatcher,
    Q = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'swampManager',
        singleton: true,
        inject: ['env',
            'utils',
            'swampServicesManager',
            'dashboardManager',
            'cliManager',
            'logWorkerManager',
            'mainLoggersManager',
            'unixSocketsManager',
            'optionsManager']
    },

    constructor: function () {

        this._disposeDeferred = null;

    },

    initialize: function () {

        this.swampServicesManager.autoRun()

            .then(this._onSwampServicesAutoRunSuccess.bind(this))

            .fail(this._onSwampServicesAutoRunFail.bind(this));


        this.cliManager.launch();

        this.dashboardManager.launch();

        this._bindEvents();
    },

    serialize: function () {

        return {
            info: {
                totalmem: this.utils.getTotalMemory(),
                mode: this.optionsManager.getOptions().mode
            },

            logs: {
                out: this.mainLoggersManager.getOut().getAll(),
                err: this.mainLoggersManager.getError().getAll()
            }
        }

    },

    _bindEvents: function () {

        this.mainLoggersManager.getOut().on('log', this._onMainOutLogger, this);
        this.mainLoggersManager.getError().on('log', this._onMainErrLogger, this);

        process.on('SIGINT', this._onProcessExit.bind(this));
        process.on('SIGTERM', this._onProcessExit.bind(this));
        process.on('exit', this._onProcessExit.bind(this));
        process.on('error', this._onProcessError.bind(this));
        process.on('uncaughtException', this._onUncaughtException.bind(this));

    },

    _onSwampServicesAutoRunSuccess: function () {
        this.cliManager.broadcast({
            event: 'swamp.autoRun',
            data: {success: true}
        });
    },

    _onSwampServicesAutoRunFail: function () {
        this.cliManager.broadcast({
            event: 'swamp.autoRun',
            data: {success: false}
        });
    },

    _onProcessError: function (err) {

        this.dispose(err, true);

    },

    _onUncaughtException: function (err) {

        this.dispose(err, true);

    },

    _onProcessExit: function () {

        this.dispose(null, true);
    },

    _onMainOutLogger: function (logData) {
        this.fireEvent('stdout', logData);
    },

    _onMainErrLogger: function (logData) {
        this.fireEvent('stderr', logData);
    },

    dispose: function (err, exitProcess) {

        if (this._disposeDeferred) {

            return this._disposeDeferred.promise;

        }

        this._disposeDeferred = Q.defer();

        if (err) {

            var errorLogger = this.mainLoggersManager.getError();
            this.utils.log('* Swamp encountered an error and now will exit...',
                this.utils.LOG_TYPE.ERROR, false, false, errorLogger);

            this.utils.log(err && err.stack ? err.stack : err.toString(),
                this.utils.LOG_TYPE.ERROR, false, false, errorLogger);

            this.utils.log('* If you believe this error related to Swamp, please report the issue to: {0}'.format(this.env.issuesUrl),
                this.utils.LOG_TYPE.ERROR, false, false, errorLogger);

        }

        // close unix sockets
        this.unixSocketsManager.dispose();

        // disconnect all CLI clients
        this.cliManager.dispose();

        // disconnect all dashboard clients
        this.dashboardManager.dispose();

        // stop all running processes before terminating swamp
        this.swampServicesManager.stopAllRunning()
            .fail(function (err) {
                console.log('Error with stopping some processes: err'.format(err && err.stack ? err.stack : JSON.stringify(err)))
            }.bind(this))
            .finally(function () {

                this.utils.log('Bye Bye...',
                    this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());

                if (this.dashboardManager.isRunning()) {
                    appolo.launcher.reset();
                }

                this._disposeDeferred.resolve();

                this.logWorkerManager.dispose();

                // exit swamp main process
                exitProcess && process.exit(0);

            }.bind(this));

        return this._disposeDeferred.promise;

    }
});
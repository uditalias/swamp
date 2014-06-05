"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'swampManager',
        singleton: true,
        inject: ['env',
            'utils',
            'swampServicesManager',
            'dashboardManager',
            'cliManager',
            'mainLoggersManager',
            'unixSocketsManager']
    },

    constructor: function() {

        this._disposed = false;

    },

    initialize: function () {

        this.swampServicesManager.autoRun();

        this.cliManager.launch();

        this.dashboardManager.launch();

        this._bindEvents();
    },

    serialize: function() {

        return {
            info: {
                totalmem: this.utils.getTotalMemory()
            },

            logs: {
                out: this.mainLoggersManager.getOut().getAll(),
                err: this.mainLoggersManager.getError().getAll()
            }
        }

    },

    _bindEvents: function() {

        this.mainLoggersManager.getOut().on('log', this._onMainOutLogger, this);
        this.mainLoggersManager.getError().on('log', this._onMainErrLogger, this);

        process.on('SIGINT', this._onProcessExit.bind(this));
        process.on('SIGTERM', this._onProcessExit.bind(this));
        process.on('uncaughtException', this._onUncaughtException.bind(this));

    },

    _onUncaughtException: function(err) {

        this._dispose(err);

    },

    _onProcessExit: function() {

        this._dispose();
    },

    _onMainOutLogger: function(logData) {
        this.fireEvent('stdout', logData);
    },

    _onMainErrLogger: function(logData) {
        this.fireEvent('stderr', logData);
    },

    _dispose: function(err) {

        if(this._disposed) {
            return;
        }

        this._disposed = true;

        if(err) {

            this.utils.log('* Swamp encountered an error and now will exit...',
                this.utils.LOG_TYPE.ERROR, false, false, this.mainLoggersManager.getError());

            this.utils.log(err.toString(),
                this.utils.LOG_TYPE.ERROR, false, false, this.mainLoggersManager.getError());

        }

        // stop all running processes before terminating swamp
        this.swampServicesManager.stopAllRunning().then(function(data) {

            // close unix sockets
            this.unixSocketsManager.dispose();

            // disconnect all CLI clients
            this.cliManager.dispose();

            // disconnect all dashboard clients
            this.dashboardManager.dispose();

            // exit swamp main process
            process.exit(0);

        }.bind(this));

    }
});
"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'swampManager',
        singleton: true,
        inject: ['env', 'utils', 'swampServicesManager', 'dashboardManager', 'cliManager', 'mainLoggersManager', 'unixSocketsManager']
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

    },

    _onProcessExit: function() {

        this.swampServicesManager.stopAllRunning();

        this.unixSocketsManager.dispose();

        this.cliManager.dispose();

        process.exit();
    },

    _onMainOutLogger: function(logData) {
        this.fireEvent('stdout', logData);
    },

    _onMainErrLogger: function(logData) {
        this.fireEvent('stderr', logData);
    }

});
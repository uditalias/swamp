"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'swampManager',
        singleton: true,
        inject: ['env', 'utils', 'swampServicesManager', 'dashboardManager', 'mainLoggers']
    },

    initialize: function () {

        this.swampServicesManager.autoRun();

        this.dashboardManager.launch();

        this._bindEvents();
    },

    serialize: function() {

        return {
            logs: {
                out: this.mainLoggers.out.getAll(),
                err: this.mainLoggers.err.getAll()
            }
        }

    },

    _bindEvents: function() {

        this.mainLoggers.out.on('log', this._onMainOutLogger, this);
        this.mainLoggers.err.on('log', this._onMainErrLogger, this);

        process.on('SIGINT', this._onProcessExit.bind(this));

    },

    _onProcessExit: function() {

        this.swampServicesManager.stopAllRunning();

        process.kill();
    },

    _onMainOutLogger: function(logData) {
        this.fireEvent('stdout', logData);
    },

    _onMainErrLogger: function(logData) {
        this.fireEvent('stderr', logData);
    }

});
"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'swampManager',
        singleton: true,
        inject: ['env', 'utils', 'swampServicesManager', 'dashboardManager']
    },

    initialize: function () {

        this.swampServicesManager.autoRun();

        this.dashboardManager.launch();

        this._bindEvents();
    },

    _bindEvents: function() {

        process.on('SIGINT', this._onProcessExit.bind(this));

    },

    _onProcessExit: function() {

        this.swampServicesManager.stopAllRunning();

        process.kill();
    }

});
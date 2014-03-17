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

        this._ensureSwampLogDirsExists();

        this.swampServicesManager.autoRun();

        this.dashboardManager.launch();

    },

    _ensureSwampLogDirsExists: function() {

        this.utils.mkdir('logs');
        this.utils.mkfile('logs/out.log', 'w');
        this.utils.mkfile('logs/err.log', 'w');

    }


});
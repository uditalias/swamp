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

        this._setMainProcessLoggers();

        this.swampServicesManager.autoRun();

        this.dashboardManager.launch();
    },

    _setMainProcessLoggers: function() {

        this._ensureSwampLogDirsExists();

        //process.stdout.on('data', this._onProcessData.bind(this));
        //process.stderr.on('data', this._onProcessError.bind(this));
    },

    _onProcessError: function(data) {

        data = data.toString();

        //this.swampLoggers.log('info', data);
    },

    _onProcessData: function(data) {

        data = data.toString();

        //this.swampLoggers.log('error', data);

    },

    _ensureSwampLogDirsExists: function() {

        this.utils.mkdir('logs');
        this.utils.mkfile('logs/out.log', 'w');
        this.utils.mkfile('logs/err.log', 'w');

    }

});
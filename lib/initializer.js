"use strict";

var Class    = require('appolo').Class,
    _        = require('lodash'),
    Q        = require('q');

module.exports = Class.define({
    $config: {
        id: 'initializer',
        singleton: true,
        inject: ['env', 'utils', 'optionsManager', 'environmentsManager', 'swampServicesManager', 'dashboardManager']
    },

    config: function(conf) {

        this._ensureSwampLogDirsExists();

        this.optionsManager.initialize(conf.options);

        this.environmentsManager.initialize(conf.environments);

        this.swampServicesManager.initialize(conf.services);

        this._start();
    },

    _start: function() {

        this.swampServicesManager.autoRun();

        this.dashboardManager.launch();
    },

    _ensureSwampLogDirsExists: function() {

        this.utils.mkdir('logs');
        this.utils.mkfile('logs/out.log', 'w');
        this.utils.mkfile('logs/err.log', 'w');

    }
});
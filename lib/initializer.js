"use strict";

var appolo      = require('appolo'),
    Class       = appolo.Class,
    Q           = require('q');

module.exports = Class.define({
    $config: {
        id: 'initializer',
        singleton: true,
        inject: ['utils', 'optionsManager', 'environmentsManager', 'swampServicesManager', 'swampManager', 'unixSocketsManager']
    },

    config: function(conf) {

        this.optionsManager.initialize(conf.options);

        this.unixSocketsManager.initialize(conf.unix_sockets);

        this.environmentsManager.initialize(conf.environments);

        this.swampServicesManager.initialize(conf.services);

        this._start();
    },

    _start: function() {

        this.swampManager.initialize();

    }
});
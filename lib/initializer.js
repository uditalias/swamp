"use strict";

var appolo      = require('appolo'),
    Class       = appolo.Class,
    Q           = require('q');

module.exports = Class.define({
    $config: {
        id: 'initializer',
        singleton: true,
        inject: ['utils', 'optionsManager', 'environmentsManager', 'swampServicesManager', 'swampManager', 'unixSocketsManager', 'mainLoggersManager']
    },

    config: function(conf) {

        this.optionsManager.initialize(conf.options);

        this.mainLoggersManager.initialize(this._getLogsConf(conf))

        this.unixSocketsManager.initialize(conf.unix_sockets);

        this.environmentsManager.initialize(conf.environments);

        this.swampServicesManager.initialize(conf.services);

        this._start();
    },

    _start: function() {

        this.swampManager.initialize();

    },

    _getLogsConf: function(conf) {

        if(conf.options && conf.options.logs) {
            return conf.options.logs;
        }

        return null;
    }
});
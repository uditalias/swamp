"use strict";

var appolo      = require('appolo-express'),
    Class       = appolo.Class,
    Q           = require('q');

module.exports = Class.define({
    $config: {
        id: 'initializer',
        singleton: true,
        inject: [
            'optionsManager',
            'mainLoggersManager',
            'unixSocketsManager',
            'environmentsManager',
            'commandsManager',
            'swampServicesManager',
            'usersManager',
            'swampManager',
            'propertiesService'
        ]
    },

    config: function(conf) {

        this.propertiesService.process(conf);

        this.optionsManager.initialize(conf.options);

        this.mainLoggersManager.initialize(conf.logs);

        this.unixSocketsManager.initialize(conf.unix_sockets);

        this.environmentsManager.initialize(conf.environments);

        this.commandsManager.initialize(conf.commands);

        this.swampServicesManager.initialize(conf.services);

        if(conf.options.dashboard && conf.options.dashboard.credentials) {
            this.usersManager.initialize(conf.options.dashboard.credentials);
        }

        this._start();
    },

    _start: function() {

        this.swampManager.initialize();

    }
});
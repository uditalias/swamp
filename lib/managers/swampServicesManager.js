"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'swampServicesManager',
        singleton: true,
        properties: [
            {
                name: '_createSwampService',
                factoryMethod: 'swampService'
            }
        ],
        inject: ['env', 'utils']
    },

    constructor:function(){
        this._services = {};
    },

    initialize: function (services) {

        _.forEach(services || [], this._onEachService.bind(this));

    },

    autoRun: function() {

        if(this.count() == 0) {
            this.utils.log('No services found in the Swamp');
            return;
        }

        var runningServices = 0;

        _.forEach(this.getAll(), function(service) {

            if(service.getOption('autorun')) {
                service.start();
                runningServices++;
            }

        });

        if(!runningServices) {
            this.utils.log('No services configured to autorun');
        }

    },

    getAll: function() {
        return this._services;
    },

    getByName: function(serviceName) {
        return this._services[serviceName] || null;
    },

    count: function() {
        return Object.keys(this._services).length;
    },

    _onEachService: function(srv) {

        var defaultOptions = this._getDefaultOptions();

        srv.options = _.extend(defaultOptions, srv.options || {});

        var service = this._createSwampService(srv);

        this._services[service.name] = service;

    },

    _getDefaultOptions: function() {
        return {
            "autorun": false,
            "restartOnChange": false,
            "runForever": true,
            "maxRetries": -1
        };
    }
});
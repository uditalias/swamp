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
        inject: ['env', 'utils', 'mainLoggers']
    },

    constructor:function(){
        this._services = {};
    },

    initialize: function (services) {

        _.forEach(services || [], this._onEachService.bind(this));

    },

    autoRun: function() {

        if(this.count() == 0) {
            this.utils.log('No services found in the Swamp', this.utils.LOG_TYPE.INFO, false, false, this.mainLoggers.out);
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
            this.utils.log('No services configured to autorun', false, false, this.mainLoggers.out);
        }

    },

    stopAllRunning: function() {

        _.forEach(this.getAll(), function(service) {

            if(service.isRunning) {
                service.stop();
            }

        });

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

    startService: function(serviceName, environment) {
        var service = this.getByName(serviceName);
        if(service) {
            service.start(environment);
        }
    },

    stopService: function(serviceName) {
        var service = this.getByName(serviceName);
        if(service) {
            service.stop();
        }
    },

    restartService: function(serviceName, environment) {
        var service = this.getByName(serviceName);
        if(service) {
            service.restart(environment);
        }
    },

    serialize: function() {
        var services = [];

        _.forEach(this.getAll(), function(service) {

            services.push(service.serialize());

        });

        return services;
    },

    _onEachService: function(srv) {

        var defaultOptions = this._getDefaultOptions();

        srv.options = _.extend(defaultOptions, srv.options || {});

        var service = this._createSwampService(srv);

        this._services[service.name] = service;

        this._bindServiceEvents(service);

    },

    _bindServiceEvents: function(service) {
        service.on('start', this._onServiceStart, this);
        service.on('stop', this._onServiceStop, this);
        service.on('restart', this._onServiceRestart, this);
        service.on('stderr', this._onServiceError, this);
        service.on('stdout', this._onServiceOut, this);
        service.on('monitor', this._onServiceMonitor, this);
    },

    _onServiceStart: function(serviceName, data) {
        this.fireEvent('start', serviceName, data);
    },

    _onServiceStop: function(serviceName, data) {
        this.fireEvent('stop', serviceName, data);
    },

    _onServiceRestart: function(serviceName) {
        this.fireEvent('restart', serviceName);
    },

    _onServiceError: function(serviceName, data) {
        this.fireEvent('stderr', serviceName, data);
    },

    _onServiceOut: function(serviceName, data) {
        this.fireEvent('stdout', serviceName, data);
    },

    _onServiceMonitor: function(serviceName, data) {
        this.fireEvent('monitor', serviceName, data);
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

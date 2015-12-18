"use strict";
var EventDispatcher     = require('appolo-express').EventDispatcher,
    async               = require('async'),
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
        inject: ['env', 'utils', 'mainLoggersManager', 'commandsManager']
    },

    constructor:function(){
        this._services = {};
        this._isAutoRunFinished = false;
    },

    initialize: function (services) {

        _.forEach(services || [], this._onEachService.bind(this));

    },

    autoRun: function() {

        var deferred = Q.defer();

        if(this.count() == 0) {
            this.utils.log(this.LOG_TEMPLATES.NO_SERVICES_FOUND, this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());
            this._isAutoRunFinished = true;
            return Q();
        }

        var autorunServices = _.where(this.getAll(), function(service) {

            return service.getOption('autorun');

        });

        this._applyServicesByOrder(autorunServices, 'start', false, deferred);

        if(autorunServices.length == 0) {
            this._isAutoRunFinished = true;
            this.utils.log(this.LOG_TEMPLATES.NO_AUTORUN_SERVICES, this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());
        }

        return deferred.promise;

    },

    isAutoRunFinished: function() {
        return this._isAutoRunFinished;
    },

    restartAllRunning: function() {

        var deferred = Q.defer();

        var runningServices = _.where(this.getAll(), function(service) {
            return service.isRunning;
        });

        if(runningServices.length > 0) {
            this.stopAllRunning()
                .then(function() {
                    this._applyServicesByOrder(runningServices, 'restart', true, deferred);
                }.bind(this));
        } else {
            deferred.reject();
        }

        return deferred.promise;
    },

    stopAllRunning: function() {

        var promises = [];

        _.forEach(this.getAll(), function(service) {

            if(service.isRunning) {
                service.pending();

                promises.push(service.stop());
            }
        });

        return Q.all(promises);

    },

    stopAllPending: function() {
        var promises = [];

        _.forEach(this.getAll(), function(service) {

            if(service.isPending()) {

                promises.push(service.stop());

            }

        });

        return Q.all(promises);
    },

    startAll: function() {

        var deferred = Q.defer();

        var stoppedServices = _.where(this.getAll(), function(service) {

            return !service.isRunning;

        });

        this._applyServicesByOrder(stoppedServices, 'start', true, deferred);

        return deferred.promise;

    },
    listServices: function(){

        var services = this.getAll();
        return Q(services);
    },

    applyPreset: function(preset) {

        var deferred = Q.defer();

        var presetServices = preset.getServices();

        if(presetServices.length > 0) {

            var services = _.where(this.getAll(), function(service) {

                return _.contains(presetServices, service.name);

            });

            if(services.length > 0) {

                this.stopAllRunning()

                    .then(function() {

                        this._applyServicesByOrder(services, 'start', true, deferred);

                    }.bind(this));

            } else {

                deferred.resolve();

            }
        }

        return deferred.promise;
    },

    getAll: function() {
        return this._services;
    },

    getByName: function(serviceName) {
        return this._services[serviceName] || null;
    },

    getById: function(serviceId) {
        return _.first(_.where(this._services, { id: serviceId }));
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

    setEnvironments: function(serviceName, environments) {
        var service = this.getByName(serviceName);
        if(service) {
            service.setEnvironments(environments);
        }
    },

    executeCommand: function(serviceName, commandId) {
        var service = this.getByName(serviceName);
        if(service) {
            this.commandsManager.executeServiceCommand(service, commandId);
        }
    },

    serialize: function(includeLogs) {

        includeLogs = includeLogs == undefined ? true : includeLogs;

        var services = [];

        _.forEach(this.getAll(), function(service) {
            //console.log('service name {0}'.format(service))

            services.push(service.serialize(includeLogs));

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
        service.on('pending', this._onServicePending, this);
        service.on('starting', this._onServiceStarting, this);
        service.on('modifyEnvironments', this._onServiceModifyEnvironments, this);
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

    _onServicePending: function(serviceName) {
        this.fireEvent('pending', serviceName);
    },

    _onServiceStarting: function(serviceName) {
        this.fireEvent('starting', serviceName);
    },

    _onServiceModifyEnvironments: function(serviceName, data) {
        this.fireEvent('modifyEnvironments', serviceName, data);
    },

    _applyServicesByOrder: function(services, method, passEnv, deferred) {

        var orderedServices = _.sortBy(services, function(service) {

            service.pending();

            return service.getOption('startIndex');

        });

        var servicesSeries = _.map(orderedServices, function(service) {
            return function(callback){

                service[method] && service[method](passEnv ? service.runningEnvironment : null, callback);

            }
        });

        async.series(servicesSeries, this._onServicesAppliedByOrder.bind(this, deferred));

    },

    _onServicesAppliedByOrder: function(deferred, err) {
        this._isAutoRunFinished = true;

        if(err) {

            this.stopAllPending();

            deferred.reject(err);

        } else {

            this.utils.log(this.LOG_TEMPLATES.ALL_SERVICES_STARTED, this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());

            deferred.resolve();
        }
    },

    _getDefaultOptions: function() {
        return {
            "startIndex": -1,
            "autorun": false,
            "runForever": true,
            "maxRetries": -1,
            "minRuntime": 1000,
            "maxLogsToSave": 100,
            "restartGapFactor": 500,
            "waitForReady": false
        };
    },

    LOG_TEMPLATES: {
        NO_SERVICES_FOUND: 'No services found in the Swamp',
        NO_AUTORUN_SERVICES: 'No services configured to auto run',
        ALL_SERVICES_STARTED: 'all swamp services has started'
    }
});

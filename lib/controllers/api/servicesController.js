var appolo          = require('appolo-express'),
    _               = require('lodash');

module.exports = appolo.Controller.define({
    $config: {
        id: 'servicesController',
        inject: ['env', 'swampServicesManager'],
        routes: [
            {
                path: "/api/services/:serviceName/state/",
                method: 'get',
                controller: 'services',
                action: 'getServiceState',
                middleware: ['userAuthMiddleware']
            },
            {
                path: "/api/services/:serviceName/start/",
                method: 'post',
                controller: 'services',
                action: 'postServiceStart',
                middleware: ['userAuthMiddleware']
            },
            {
                path: "/api/services/:serviceName/stop/",
                method: 'post',
                controller: 'services',
                action: 'postServiceStop',
                middleware: ['userAuthMiddleware']
            },
            {
                path: "/api/services/:serviceName/restart/",
                method: 'post',
                controller: 'services',
                action: 'postServiceRestart',
                middleware: ['userAuthMiddleware']
            },
            {
                path: "/api/services/state/",
                method: 'get',
                controller: 'services',
                action: 'getServicesState',
                middleware: ['userAuthMiddleware']
            },
            {
                path: "/api/services/start/",
                method: 'post',
                controller: 'services',
                action: 'postServicesStartAll',
                middleware: ['userAuthMiddleware']
            },
            {
                path: "/api/services/stop/",
                method: 'post',
                controller: 'services',
                action: 'postServicesStopAllRunning',
                middleware: ['userAuthMiddleware']
            },
            {
                path: "/api/services/restart/",
                method: 'post',
                controller: 'services',
                action: 'postServicesRestartAllRunning',
                middleware: ['userAuthMiddleware']
            }
        ]
    },

    getServiceState: function(req, res) {

        var serviceName = req.params.serviceName;

        var service = this.swampServicesManager.getByName(serviceName);

        if(service) {
            this.sendOk({
                name: service.name,
                state: service.getPhase()
            });
        } else {
            this.sendNotFound();
        }
    },

    postServiceStart: function(req, res) {

        var serviceName = req.params.serviceName;
        var environment = req.body.environment;
        var service = this.swampServicesManager.getByName(serviceName);

        if(!service) {
            return this.sendNotFound();
        }

        this.swampServicesManager.startService(serviceName, environment);

        this.sendOk({});
    },

    postServiceStop: function(req, res) {

        var serviceName = req.params.serviceName;
        var service = this.swampServicesManager.getByName(serviceName);

        if(!service) {
            return this.sendNotFound();
        }

        this.swampServicesManager.stopService(serviceName);

        this.sendOk({});
    },

    postServiceRestart: function(req, res) {

        var serviceName = req.params.serviceName;
        var environment = req.body.environment;
        var service = this.swampServicesManager.getByName(serviceName);

        if(!service) {
            return this.sendNotFound();
        }

        this.swampServicesManager.restartService(serviceName, environment);

        this.sendOk({});
    },

    getServicesState: function(req, res) {

        var services = this.swampServicesManager.getAll();

        var response = [];

        _.forEach(services, function(service) {

            response.push({
                name: service.name,
                state: service.getPhase()
            });

        });

        this.sendOk(response);
    },

    postServicesStartAll: function(req, res) {

        this.swampServicesManager.startAll();

        this.sendOk({});
    },

    postServicesStopAllRunning: function(req, res) {

        this.swampServicesManager.stopAllRunning();

        this.sendOk({});
    },

    postServicesRestartAllRunning: function(req, res) {

        this.swampServicesManager.restartAllRunning();

        this.sendOk({});
    }
});

"use strict";
var appolo = require('appolo'),
    fs  = require('fs'),
    Q = require('q');

module.exports = appolo.Controller.define({

    $config: {
        id: 'ioStreamController',
        inject: ['env', 'swampServicesManager', 'optionsManager']
    },

    get: function (req, res) {

        var ioType = this.req.param('type');
        var serviceId = this.req.param('serviceId');
        var service = this.swampServicesManager.getById(serviceId);

        if(service) {
            res.render('ioStream', this._getViewParams(ioType, serviceId, service));
        } else {
            res.send(404, 'service not found in the swamp');
        }

    },

    _getSocketIOConnectionString: function() {
        var port = this.optionsManager.getOptions().dashboard.port;
        var hostname = this.optionsManager.getOptions().dashboard.hostname || 'localhost';

        return 'http://{0}:{1}/'.format(hostname, port);
    },

    _getViewParams: function(ioType, serviceId, service) {

        if(ioType == 'out') {
            ioType = 'STDOUT';
        } else if(ioType == 'error') {
            ioType = 'STDERR';
        }

        return {
            socketConnectionString: this._getSocketIOConnectionString(),
            swampVersion: this.env.version,
            serviceId: serviceId,
            serviceName: service.name,
            ioType: ioType
        };

    }
});
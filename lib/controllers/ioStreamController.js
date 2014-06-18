"use strict";
var appolo  = require('appolo'),
    fs      = require('fs'),
    path    = require('path'),
    Q       = require('q');

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

            this._sendServiceNotFoundResponse();

        }
    },

    getStream: function(req, res) {

        var ioType = this.req.param('type');
        var serviceId = this.req.param('serviceId');
        var service = this.swampServicesManager.getById(serviceId);

        if(service) {

            var stdPaths    = service.getCurrentSTDFilesPath(),
                path        = null;

            if(ioType == 'error') {

                path = stdPaths.err;

            } else if(ioType == 'out') {

                path = stdPaths.out;

            }

            if(path) {

                var readStream = fs.createReadStream(path);

                readStream.on('open', function () {

                    readStream.pipe(res);

                });

            } else {

                this._sendServiceNotFoundResponse();

            }

        } else {

            this._sendServiceNotFoundResponse();

        }

    },

    getLogFilesList: function(req, res) {

        var ioType = this.req.param('type');
        var serviceId = this.req.param('serviceId');
        var service = this.swampServicesManager.getById(serviceId);

        if(ioType == 'error') {
            ioType = 'err';
        }

        if(service) {

            var stdPaths = service.getCurrentSTDFilesPath();

            var logsPath = path.dirname(stdPaths[ioType]);

            this._getPathFilesList(logsPath)

                .then(this._onPathFilesResponse.bind(this, ioType))

                .fail(this.jsonError.bind(this));

        } else {

            this._sendServiceNotFoundResponse();

        }
    },

    _onPathFilesResponse: function(ioType, files) {

        var responseFiles = [];

        _.forEach(files, function(file) {

            if(ioType == 'out' && file.match(/out(.*)[.]/)) {

                responseFiles.push(file);

            } else if(ioType == 'err' && file.match(/err(.*)[.]/)) {

                responseFiles.push(file);

            }

        });

        this.jsonSuccess(responseFiles);

    },

    _getPathFilesList: function(path) {

        var deferred = Q.defer();

        fs.readdir(path, function(err, files) {

            if(err) {

                deferred.reject(err);

            } else {

                deferred.resolve(files);

            }
        });

        return deferred.promise;

    },

    _sendServiceNotFoundResponse: function() {

        this.jsonError('service not found in the swamp');

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
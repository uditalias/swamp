"use strict";
var appolo = require('appolo-express'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q');

module.exports = appolo.Controller.define({

    $config: {
        id: 'ioStreamController',
        inject: ['env', 'swampServicesManager', 'optionsManager']
    },

    get: function (req, res) {

        var ioType = this.req.params.type;
        var serviceId = this.req.params.serviceId;
        var service = this.swampServicesManager.getById(serviceId);

        if (service) {

            res.render('ioStream.ejs', this._getViewParams(ioType, serviceId, service));

        } else {

            this._sendServiceNotFoundResponse();

        }
    },

    getStream: function (req, res) {

        var ioType = this.req.params.type;
        var serviceId = this.req.params.serviceId;
        var fileName = this.req.query['fileName'];
        var service = this.swampServicesManager.getById(serviceId);

        if (service) {

            var stdPaths = service.getCurrentSTDFilesPath(),
                filePath = null;

            if (ioType == 'error') {

                filePath = stdPaths.err;

            } else if (ioType == 'out') {

                filePath = stdPaths.out;

            }

            if (path) {

                if (fileName) {

                    filePath = this._replacePathFile(filePath, fileName);

                }

                var readStream = fs.createReadStream(filePath);

                readStream.on('open', function () {

                    readStream.pipe(res);

                });

                readStream.on('error', function (err) {

                    this._sendError(err);

                }.bind(this));

            } else {

                this._sendServiceNotFoundResponse();

            }

        } else {

            this._sendServiceNotFoundResponse();

        }

    },

    getLogFilesList: function (req, res) {

        var ioType = this.req.params.type;
        var serviceId = this.req.params.serviceId;
        var service = this.swampServicesManager.getById(serviceId);

        if (ioType == 'error') {
            ioType = 'err';
        }

        if (service) {

            var stdPaths = service.getCurrentSTDFilesPath();

            var logsPath = path.dirname(stdPaths[ioType]);

            this._getPathFilesList(logsPath)

                .then(this._onPathFilesResponse.bind(this, ioType))

                .then(this._getFilesStats.bind(this, logsPath))

                .fail(this.jsonError.bind(this));

        } else {

            this._sendServiceNotFoundResponse();

        }
    },

    _replacePathFile: function (filePath, fileName) {

        var currentPathFileName = path.basename(filePath);

        return filePath.replace(currentPathFileName, fileName);

    },

    _onPathFilesResponse: function (ioType, files) {

        var responseFiles = [];

        _.forEach(files, function (file) {

            if (ioType == 'out' && file.match(/out(.*)[.]/)) {

                responseFiles.push(file);

            } else if (ioType == 'err' && file.match(/err(.*)[.]/)) {

                responseFiles.push(file);

            }

        });

        return responseFiles;

    },

    _getFilesStats: function (logsPath, files) {
        var promises = [];
        var statsFiles = [];
        var promise;

        _.forEach(files, function (file) {
            promise = Q.denodeify(fs.stat.bind(fs.stat))(path.resolve(logsPath, file));

            promises.push(promise);

            promise.then(function (stats) {
                stats.filename = file;
                statsFiles.push(stats);
                return stats;
            });
        });

        Q.all(promises)
            .then(this.jsonSuccess.bind(this, statsFiles));
    },

    _getPathFilesList: function (requestPath) {

        var deferred = Q.defer();

        fs.readdir(requestPath, function (err, files) {

            if (err) {

                deferred.reject(err);

            } else {

                deferred.resolve(files);

            }
        });

        return deferred.promise;

    },

    _sendServiceNotFoundResponse: function () {

        this.jsonError('service not found in the swamp');

    },

    _sendError: function (err) {
        this.jsonError(err.toString());
    },

    _getSocketIOConnectionString: function () {
        var port = this.optionsManager.getOptions().dashboard.port;
        var hostname = this.optionsManager.getOptions().dashboard.hostname || 'localhost';

        return 'http://{0}:{1}/'.format(hostname, port);
    },

    _getViewParams: function (ioType, serviceId, service) {

        if (ioType == 'out') {
            ioType = 'STDOUT';
        } else if (ioType == 'error') {
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
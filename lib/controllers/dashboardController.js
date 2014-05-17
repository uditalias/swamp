"use strict";
var appolo = require('appolo'),
    fs  = require('fs'),
    Q = require('q');

module.exports = appolo.Controller.define({

    $config: {
        id: 'dashboardController',
        inject: ['env', 'optionsManager']
    },

    get: function (req, res) {

        res.render('index', this._getViewParams());

    },

    _getSocketIOConnectionString: function() {
        var port = this.optionsManager.getOptions().dashboard.port;
        var hostname = this.optionsManager.getOptions().dashboard.hostname || 'localhost';

        return 'http://{0}:{1}/'.format(hostname, port);
    },

    _getSocketIOClientLibUrl: function() {
        var port = this.optionsManager.getOptions().dashboard.port;
        var hostname = this.optionsManager.getOptions().dashboard.hostname || 'localhost';

        return 'http://{0}:{1}/socket.io/socket.io.js'.format(hostname, port);
    },

    _getViewParams: function() {

        return {
            socketClientLibUrl: this._getSocketIOClientLibUrl(),
            socketConnectionString: this._getSocketIOConnectionString(),
            swampVersion: this.env.version
        };

    }
});
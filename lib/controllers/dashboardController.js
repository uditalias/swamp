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

        res.render('index', { socketClientLibUrl: this._getSocketIOClientLibUrl() });

    },

    _getSocketIOClientLibUrl: function() {
        var port = this.optionsManager.getOptions().dashboard.port;

        return 'http://{0}:{1}/socket.io/socket.io.js'.format('localhost', port);
    }
});
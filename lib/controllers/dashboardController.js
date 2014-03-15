"use strict";
var appolo = require('appolo'),
    fs  = require('fs'),
    Q = require('q');

module.exports = appolo.Controller.define({

    $config: {
        id: 'dashboardController',
        initMethod: 'initialize',
        properties:[{
            name: '_createSocketClient',
            factoryMethod: 'socketClient'
        }],
        inject: ['env', 'optionsManager', 'io']
    },

    constructor: function () {
        this._clients = {};
        this.clientsConnected = 0;
    },

    initialize: function () {

        this.io.sockets.on('connection', this._onSocketConnection.bind(this));
    },

    get: function (req, res) {

        res.render('index', { socketLibUrl: this._getSocketIOClientLibUrl() });

    },

    _getSocketIOClientLibUrl: function() {
        var port = this.optionsManager.getOptions().dashboard.port;

        return 'http://{0}:{1}/socket.io/socket.io.js'.format('localhost', port);
    },

    _onSocketConnection: function(socket) {

        var socketClient = this.createSocketClient(socket);

        socketClient.on('disconnect', this._onSocketDisconnected, this);

        this._clients[socketClient.getSocketId()] = socketClient;

        this.clientsConnected++;

    },

    _onSocketDisconnected: function (socketClient) {

        socketClient.un('disconnect', this._onSocketDisconnected, this);

        var socketId = socketClient.getSocketId();

        this._clients[socketId] = null;
        delete this._clients[socketId];

        this.clientsConnected--;
    }
});
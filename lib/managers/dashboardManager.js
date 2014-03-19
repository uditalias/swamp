"use strict";
var appolo              = require('appolo'),
    EventDispatcher     = appolo.EventDispatcher,
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'dashboardManager',
        singleton: true,
        initMethod: 'initialize',
        properties:[{
            name: '_createSocketClient',
            factoryMethod: 'socketClient'
        }],
        inject: ['env', 'utils', 'optionsManager', 'mainLoggers', 'io']
    },

    initialize: function() {

        this._clients = {};

        this.io.sockets.on('connection', this._onSocketConnection.bind(this));

    },

    launch: function () {

        this._launchWebServer();

    },

    _onSocketConnection: function(socket) {

        var socketClient = this._createSocketClient(socket);

        socketClient.on('disconnect', this._onSocketDisconnected, this);

        this._clients[socketClient.getSocketId()] = socketClient;

        this.broadcast({text: 'hello world!'});

    },

    _onSocketDisconnected: function (socketClient) {

        socketClient.un('disconnect', this._onSocketDisconnected, this);

        var socketId = socketClient.getSocketId();

        this._clients[socketId] = null;
        delete this._clients[socketId];
    },

    broadcast: function(message) {

        _.forEach(this._clients, function(client) {
            client.sendMessage(message);
        });

    },

    _launchWebServer: function() {

        var port = this.optionsManager.getOptions().dashboard.port;
        var credentials = this.optionsManager.getOptions().dashboard.credentials || {};
        var message = "Swamp dashboard listening to port {0}".format(port);

        appolo.launcher.startServer(port, credentials, message, this._onServerListenStart.bind(this));
    },

    _onServerListenStart: function() {

        if(this.optionsManager.getOptions().dashboard.autoLaunch) {
            this.open();
        }

    },

    open: function() {
        var port =  this.optionsManager.getOptions().dashboard.port;
        var hostname = this.optionsManager.getOptions().dashboard.hostname;

        var url = 'http://{0}:{1}/'.format(hostname, port);

        this.utils.log('\r\nRunning dashboard ({0})'.format(url), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggers.out);

        this.utils.openUrl(url);
    }
});
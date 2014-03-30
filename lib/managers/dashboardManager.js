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
        inject: ['env', 'utils', 'optionsManager', 'mainLoggers', 'io', 'swampServicesManager', 'swampManager']
    },

    initialize: function() {

        this._clients = {};

        this._bindServicesManagerEvents();
        this._bindSwampManagerEvents();

        this.io.sockets.on('connection', this._onSocketConnection.bind(this));

    },

    launch: function () {

        this._launchWebServer();

    },

    _onSocketConnection: function(socket) {

        var socketClient = this._createSocketClient(socket);

        socketClient.on('service.start', this._onClientServiceStartRequest, this);
        socketClient.on('service.stop', this._onClientServiceStopRequest, this);
        socketClient.on('service.restart', this._onClientServiceRestartRequest, this);
        socketClient.on('swamp.stopAllRunning', this._onClientSwampStopAllRunningRequest, this);
        socketClient.on('swamp.restartAllRunning', this._onClientSwampRestartAllRunningRequest, this);
        socketClient.on('disconnect', this._onSocketDisconnected, this);

        var cid = socketClient.getSocketId();

        this._clients[cid] = socketClient;

        this._sendSwampInitialData(cid);

    },

    _onClientServiceStartRequest: function(serviceName, environment) {
        this.swampServicesManager.startService(serviceName, environment);
    },

    _onClientServiceStopRequest: function(serviceName) {
        this.swampServicesManager.stopService(serviceName);
    },

    _onClientServiceRestartRequest: function(serviceName, environment) {
        this.swampServicesManager.restartService(serviceName, environment);
    },

    _onClientSwampRestartAllRunningRequest: function() {
        this.swampServicesManager.restartAllRunning();
    },

    _onClientSwampStopAllRunningRequest: function() {
        this.swampServicesManager.stopAllRunning();
    },

    _onSocketDisconnected: function (socketClient) {

        socketClient.un('service.start', this._onClientServiceStartRequest, this);
        socketClient.un('service.stop', this._onClientServiceStopRequest, this);
        socketClient.un('service.restart', this._onClientServiceRestartRequest, this);
        socketClient.un('swamp.restartAllRunning', this._onClientSwampRestartAllRunningRequest, this);
        socketClient.un('swamp.stopAllRunning', this._onClientSwampStopAllRunningRequest, this);
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

    open: function() {
        var port =  this.optionsManager.getOptions().dashboard.port;
        var hostname = this.optionsManager.getOptions().dashboard.hostname || 'localhost';

        var url = 'http://{0}:{1}/'.format(hostname, port);

        this.utils.log('\r\nRunning dashboard ({0})'.format(url), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggers.out);

        this.utils.openUrl(url);
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

    _sendSwampInitialData: function(clientId) {

        var client = this._clients[clientId];

        if(client) {
            var services = this.swampServicesManager.serialize();
            var swamp = this.swampManager.serialize();

            client.sendMessage({ event: 'swamp.initialData', data: { services: services, swamp : swamp } });
        }
    },

    _bindSwampManagerEvents: function() {

        this.swampManager.on('stdout', this._onSwampOut, this);

        this.swampManager.on('stderr', this._onSwampError, this);

    },

    _onSwampOut: function(data) {
        this.broadcast({ event: 'swamp.out', data: { log: data } });
    },

    _onSwampError: function(data) {
        this.broadcast({ event: 'swamp.error', data: { log: data } });
    },

    _bindServicesManagerEvents: function() {

        //update all clients about swampServices events

        this.swampServicesManager.on('start', this._onSwampServiceStarted, this);
        this.swampServicesManager.on('stop', this._onSwampServiceStoped, this);
        this.swampServicesManager.on('restart', this._onSwampServiceRestarted, this);
        this.swampServicesManager.on('stderr', this._onSwampServiceError, this);
        this.swampServicesManager.on('stdout', this._onSwampServiceOut, this);
        this.swampServicesManager.on('monitor', this._onSwampServiceMonitorData, this);
    },

    _onSwampServiceStarted: function(serviceName, params) {
        this.broadcast({ event: 'service.start', data: params });
    },

    _onSwampServiceStoped: function(serviceName, params) {
        this.broadcast({ event: 'service.stop', data: params });
    },

    _onSwampServiceRestarted: function(serviceName) {
        this.broadcast({ event: 'service.restart', data: { name: serviceName } });
    },

    _onSwampServiceError: function(serviceName, data) {
        this.broadcast({ event: 'service.error', data: { name: serviceName, log: data } });
    },

    _onSwampServiceOut: function(serviceName, data) {
        this.broadcast({ event: 'service.out', data: { name: serviceName, log: data } });
    },

    _onSwampServiceMonitorData: function(serviceName, monitorData) {
        this.broadcast({ event: 'service.monitor', data: { name: serviceName, monitor: monitorData } });
    }
});
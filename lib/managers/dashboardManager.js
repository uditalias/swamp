"use strict";
var appolo              = require('appolo-express'),
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
        inject: ['env',
                 'utils',
                 'optionsManager',
                 'mainLoggersManager',
                 'commandsManager',
                 'io',
                 'swampServicesManager',
                 'swampManager']
    },

    initialize: function() {

        this._clients = {};
        this._isRunning = false;

        this._bindServicesManagerEvents();
        this._bindSwampManagerEvents();
        this._bindCommandsManagerEvents();

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
        socketClient.on('service.modifyEnvironments', this._onClientServiceModifyEnvironments, this);
        socketClient.on('service.executeCommand', this._onClientServiceExecuteCommandRequest, this);
        socketClient.on('command.terminate', this._onClientTerminateCommandRequest, this);
        socketClient.on('swamp.stopAllRunning', this._onClientSwampStopAllRunningRequest, this);
        socketClient.on('swamp.restartAllRunning', this._onClientSwampRestartAllRunningRequest, this);
        socketClient.on('swamp.startAll', this._onClientSwampStartAllRequest, this);
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

    _onClientServiceModifyEnvironments: function(serviceName, environments, restart) {

        this.swampServicesManager.setEnvironments(serviceName, environments);

        if(restart) {

            this.swampServicesManager.restartService(serviceName);
        }
    },

    _onClientServiceExecuteCommandRequest: function(serviceName, commandId) {
        this.swampServicesManager.executeCommand(serviceName, commandId);
    },

    _onClientTerminateCommandRequest: function(exeId) {
        this.commandsManager.terminateCommand(exeId);
    },

    _onClientSwampRestartAllRunningRequest: function() {
        this.swampServicesManager.restartAllRunning();
    },

    _onClientSwampStopAllRunningRequest: function() {
        this.swampServicesManager.stopAllRunning();
    },

    _onClientSwampStartAllRequest: function() {
        this.swampServicesManager.startAll();
    },

    _onSocketDisconnected: function (socketClient) {

        socketClient.un('service.start', this._onClientServiceStartRequest, this);
        socketClient.un('service.stop', this._onClientServiceStopRequest, this);
        socketClient.un('service.restart', this._onClientServiceRestartRequest, this);
        socketClient.un('service.modifyEnvironments', this._onClientServiceModifyEnvironments, this);
        socketClient.un('service.executeCommand', this._onClientServiceExecuteCommandRequest, this);
        socketClient.un('command.terminate', this._onClientTerminateCommandRequest, this);
        socketClient.un('swamp.restartAllRunning', this._onClientSwampRestartAllRunningRequest, this);
        socketClient.un('swamp.stopAllRunning', this._onClientSwampStopAllRunningRequest, this);
        socketClient.un('swamp.startAll', this._onClientSwampStartAllRequest, this);
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

        this.utils.log('\r\nRunning dashboard ({0})'.format(url), this.utils.LOG_TYPE.INFO, false, false, this.mainLoggersManager.getOut());

        this.utils.openUrl(url);
    },

    isRunning: function() {

        return this._isRunning;

    },

    _launchWebServer: function() {

        var port = this.optionsManager.getOptions().dashboard.port;

        this.utils.isPortAvailable(port)
            .then(this._startServer.bind(this, port))
            .catch(this._onPortNotAvailable.bind(this, port));
    },

    _startServer: function(port) {

        appolo.launcher.app.set('port', port);

        appolo.launcher.startServer(this._onServerListenStart.bind(this));
    },

    _onServerListenStart: function() {

        this._isRunning = true;

        if(this.optionsManager.getOptions().dashboard.autoLaunch) {

            this.open();

        }

    },

    _onPortNotAvailable: function(port) {
        this.utils.log('Error running Swamp dashboard. Port is not available. ({0})'.format(port), this.utils.LOG_TYPE.ERROR, false, false, this.mainLoggersManager.getError());
    },

    _sendSwampInitialData: function(clientId) {

        var client = this._clients[clientId];

        if(client) {
            var services = this.swampServicesManager.serialize();
            var commands = this.commandsManager.serialize();
            var swamp = this.swampManager.serialize();

            client.sendMessage({ event: 'swamp.initialData', data: { services: services, commands: commands, swamp: swamp } });
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

    _bindCommandsManagerEvents: function() {

        this.commandsManager.on('started', this._onCommandStarted, this);

        this.commandsManager.on('stdout', this._onCommandLog, this);

        this.commandsManager.on('disposed', this._onCommandDisposed, this);
    },

    _onCommandStarted: function(exeCommandId, commandId, serviceName, serializedCommand) {
        this.broadcast({ event: 'command.started', data: { exeId: exeCommandId, commandId: commandId, serviceName: serviceName, command: serializedCommand } });
    },

    _onCommandLog: function(exeCommandId, commandId, serviceName, logData) {
        this.broadcast({ event: 'command.out', data: { exeId: exeCommandId, commandId: commandId, serviceName: serviceName, log: logData } });
    },

    _onCommandDisposed: function(exeCommandId, commandId, serviceName, success) {
        this.broadcast({ event: 'command.disposed', data: { exeId: exeCommandId, commandId: commandId, serviceName: serviceName, success: success } });
    },

    _bindServicesManagerEvents: function() {

        //update all clients about swampServices events
        this.swampServicesManager.on('start', this._onSwampServiceStarted, this);
        this.swampServicesManager.on('stop', this._onSwampServiceStoped, this);
        this.swampServicesManager.on('restart', this._onSwampServiceRestarted, this);
        this.swampServicesManager.on('stderr', this._onSwampServiceError, this);
        this.swampServicesManager.on('stdout', this._onSwampServiceOut, this);
        this.swampServicesManager.on('monitor', this._onSwampServiceMonitorData, this);
        this.swampServicesManager.on('pending', this._onSwampServicePending, this);
        this.swampServicesManager.on('starting', this._onSwampServiceStarting, this);
        this.swampServicesManager.on('modifyEnvironments', this._onSwampServiceModifyEnvironments, this);
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
    },

    _onSwampServicePending: function(serviceName) {
        this.broadcast({ event: 'service.pending', data: { name: serviceName } });
    },

    _onSwampServiceStarting: function(serviceName) {
        this.broadcast({ event: 'service.starting', data: { name: serviceName } });
    },

    _onSwampServiceModifyEnvironments: function(serviceName, environments) {
        this.broadcast({ event: 'service.modifyEnvironments', data: { name: serviceName, environments: environments } });
    },

    dispose: function() {
        _.forEach(this._clients, function(client) {
            client.dispose();
        });
    }
});
"use strict";
var EventDispatcher = require('appolo-express').EventDispatcher;

module.exports = EventDispatcher.define({

    $config: {
        id: 'socketClient',
        initMethod: 'initialize',
        inject: ['sessionsManager']
    },

    constructor: function (socket) {

        this._accessToken = socket.handshake.query['x-access-token'];

        this._socket = socket;
    },

    initialize: function () {

        this._socket.on('service.start', this._onSocketServiceStart.bind(this));

        this._socket.on('service.stop', this._onSocketServiceStop.bind(this));

        this._socket.on('service.restart', this._onSocketServiceRestart.bind(this));

        this._socket.on('service.modifyEnvironments', this._onSocketServiceModifyEnvironments.bind(this));

        this._socket.on('service.executeCommand', this._onSocketServiceExecuteCommand.bind(this));

        this._socket.on('command.terminate', this._onSocketTerminateCommand.bind(this));

        this._socket.on('preset.run', this._onSocketRunPreset.bind(this));

        this._socket.on('preset.create', this._onSocketCreatePreset.bind(this));

        this._socket.on('preset.delete', this._onSocketDeletePreset.bind(this));

        this._socket.on('swamp.restartAllRunning', this._onSocketSwampRestartAllRunning.bind(this));

        this._socket.on('swamp.stopAllRunning', this._onSocketSwampStopAllRunning.bind(this));

        this._socket.on('swamp.startAll', this._onSocketSwampStartAll.bind(this));

        this._socket.on('service.log.error.subscribe', this._onSocketServiceLogErrorSubscribe.bind(this));

        this._socket.on('service.log.error.unsubscribe', this._onSocketServiceLogErrorUnsubscribe.bind(this));

        this._socket.on('service.log.out.subscribe', this._onSocketServiceLogOutSubscribe.bind(this));

        this._socket.on('service.log.out.unsubscribe', this._onSocketServiceLogOutUnsubscribe.bind(this));

        this._socket.on('disconnect', this._onSocketDisconnect.bind(this));

        this._touchSession();

    },

    sendMessage: function(message) {
        this._socket.emit('message', message);
    },

    getSocketId: function () {
        return this._socket.id;
    },

    _onSocketDisconnect: function () {

        this.fireEvent('disconnect', this);
    },

    _onSocketServiceStart: function(data) {
        var serviceName = data.name;
        var environment = data.environment;

        this.fireEvent('service.start', serviceName, environment);
    },

    _onSocketServiceStop: function(data) {
        var serviceName = data.name;

        this.fireEvent('service.stop', serviceName);
    },

    _onSocketServiceRestart: function(data) {
        var serviceName = data.name;
        var environment = data.environment;

        this.fireEvent('service.restart', serviceName, environment);
    },

    _onSocketServiceModifyEnvironments: function(data) {
        var serviceName     = data.name,
            environments    = data.environments,
            restart         = data.restart;

        this.fireEvent('service.modifyEnvironments', serviceName, environments, restart);

    },

    _onSocketServiceExecuteCommand: function(data) {

        var serviceName     = data.name,
            commandId       = data.commandId;

        this.fireEvent('service.executeCommand', serviceName, commandId);
    },

    _onSocketTerminateCommand: function(data) {

        var executionId = data.id;

        this.fireEvent('command.terminate', executionId);

    },

    _onSocketRunPreset: function(data) {

        var presetId = data.id;

        this.fireEvent('preset.run', presetId);

    },

    _onSocketCreatePreset: function(data) {

        var presetDefinition = data.preset;

        this.fireEvent('preset.create', presetDefinition);

    },

    _onSocketDeletePreset: function(data) {

        var presetId = data.presetId;

        this.fireEvent('preset.delete', presetId);

    },

    _onSocketSwampRestartAllRunning: function() {
        this.fireEvent('swamp.restartAllRunning');
    },

    _onSocketSwampStopAllRunning: function() {
        this.fireEvent('swamp.stopAllRunning');
    },

    _onSocketSwampStartAll: function() {
        this.fireEvent('swamp.startAll');
    },

    _onSocketServiceLogErrorSubscribe: function(data) {
        this._socket.join('service_log_error_' + data.serviceId);
    },

    _onSocketServiceLogErrorUnsubscribe: function(data) {
        this._socket.leave('service_log_error_' + data.serviceId);
    },

    _onSocketServiceLogOutSubscribe: function(data) {
        this._socket.join('service_log_out_' + data.serviceId);
    },

    _onSocketServiceLogOutUnsubscribe: function(data) {
        this._socket.leave('service_log_out_' + data.serviceId);
    },

    _touchSession: function() {

        var session = this.sessionsManager.get(this._accessToken);
        if(session) {
            this.sessionsManager.touch(session);
        }

        setTimeout(this._touchSession.bind(this), 1000*60*10);

    },

    dispose: function(reason) {
        reason = reason || '';

        this._socket.disconnect(reason);
    }
});
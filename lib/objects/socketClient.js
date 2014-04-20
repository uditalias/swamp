"use strict";
var EventDispatcher = require('appolo').EventDispatcher;

module.exports = EventDispatcher.define({

    $config: {
        id: 'socketClient',
        initMethod: 'initialize',
        inject: []
    },

    constructor: function (socket) {
        this._socket = socket;
    },

    initialize: function () {

        this._socket.on('service.start', this._onSocketServiceStart.bind(this));

        this._socket.on('service.stop', this._onSocketServiceStop.bind(this));

        this._socket.on('service.restart', this._onSocketServiceRestart.bind(this));

        this._socket.on('swamp.restartAllRunning', this._onSocketSwampRestartAllRunning.bind(this));

        this._socket.on('swamp.stopAllRunning', this._onSocketSwampStopAllRunning.bind(this));

        this._socket.on('swamp.startAll', this._onSocketSwampStartAll.bind(this));

        this._socket.on('disconnect', this._onSocketDisconnect.bind(this));

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

    _onSocketSwampRestartAllRunning: function() {
        this.fireEvent('swamp.restartAllRunning');
    },

    _onSocketSwampStopAllRunning: function() {
        this.fireEvent('swamp.stopAllRunning');
    },

    _onSocketSwampStartAll: function() {
        this.fireEvent('swamp.startAll');
    }
});
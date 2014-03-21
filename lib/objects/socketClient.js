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

    },

    _onSocketServiceStop: function(data) {

    },

    _onSocketServiceRestart: function(data) {

    }
});
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
    }
});
"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'unixSocketsManager',
        singleton: true,
        properties: [
            {
                name: '_createUnixSocket',
                factoryMethod: 'unixSocket'
            }
        ],
        inject: ['env']
    },

    constructor: function() {

        this._signals = 0;

        this._unixSockets = {};
    },

    initialize: function (sockets) {

        _.forEach(sockets || [], this._onEachSocket.bind(this));

    },

    dispose: function() {

        _.forEach(this._unixSockets, function(unixSocket) {

            unixSocket.dispose();

        });

    },

    _onEachSocket: function(unixSocket) {

        var unixSocketServer = this._createUnixSocket(unixSocket);

        unixSocketServer.on('error', this._onUnixSocketError, this);

        unixSocketServer.on('listening', this._onUnixSocketListening, this);

        this._unixSockets[unixSocketServer.id] = unixSocketServer;

    },

    _onUnixSocketError: function() {

    },

    _onUnixSocketListening: function() {

    }

});
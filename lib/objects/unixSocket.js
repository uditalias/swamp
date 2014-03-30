"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    net                 = require('net');

module.exports = EventDispatcher.define({

    $config: {
        id: 'unixSocket',
        singleton: false,
        inject: ['env', 'utils', 'mainLoggers'],
        initMethod: 'initialize'
    },

    constructor: function(socketFilePath) {

        this.id = null;

        this._path = socketFilePath;

        this._server = null;
    },

    initialize: function() {

        this.id = this.utils.guid();

        if(!this.utils.fileExist(this._path)) {

            this.utils.log('Can\'t find unix socket file `{0}`'.format(this._path), this.utils.LOG_TYPE.ERROR, false, false, this.mainLoggers.err);

            this.fireEvent('dispose', this.id);

            return;
        }

        this._server = net.createServer(this._onUnixSocketClientConnection.bind(this));

        this._bindEvents();

        this._listen();

    },

    dispose: function() {

        if(this._server) {

            this._server.close();

        }

    },

    _bindEvents: function() {

        this._server.on('error', this._onServerError.bind(this));

    },

    _listen: function() {

        this._server.listen(this._path, this._onServerListenStart.bind(this));

    },

    _onServerError: function(err) {

        this.utils.log('Unix socket file `{0}` error ({1})'.format(this._path, err), this.utils.LOG_TYPE.ERROR, false, false, this.mainLoggers.err);

    },

    _onServerListenStart: function() {

        this.utils.log('Unix socket file `{0}` is running'.format(this._path), this.utils.LOG_TYPE.SUCCESS, false, false, this.mainLoggers.out);

        this.fireEvent('listening', this.id);
    },

    _onUnixSocketClientConnection: function(socket) {

    }

});
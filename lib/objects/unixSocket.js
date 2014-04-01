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

    constructor: function(socket) {

        this.id = null;

        this._isRunning = false;

        this._path = socket.file || '';

        this._chmod = socket.chmod || '0700';

        this._processOriginalChmod = process.umask();

        this._server = null;
    },

    initialize: function() {

        this.id = this.utils.guid();

        if(this._path) {
            this._start();
        }

    },

    dispose: function() {

        if(this._server && this._isRunning) {

            this._server.close();

            this._isRunning = false;

            this.fireEvent('dispose', this.id);

        }

    },

    _start: function() {

        this._server = net.createServer(this._onUnixSocketClientConnection.bind(this));

        this._bindEvents();

        this._listen();

    },

    _bindEvents: function() {

        this._server.on('error', this._onServerError.bind(this));

        this._server.on('listening', this._onServerListenStart.bind(this));

    },

    _listen: function() {

        process.umask(this._chmod);

        this._server.listen(this._path);

    },

    _onServerError: function(err) {

        this.utils.log('Unix socket file `{0}` error ({1})'.format(this._path, err), this.utils.LOG_TYPE.ERROR, false, false, this.mainLoggers.err);

    },

    _onServerListenStart: function() {

        process.umask(this._processOriginalChmod);

        this._isRunning = true;

        this.utils.log('Listening to unix socket file `{0}`'.format(this._path), this.utils.LOG_TYPE.SUCCESS, false, false, this.mainLoggers.out);

        this.fireEvent('listening', this.id);
    },

    _onUnixSocketClientConnection: function(socket) {

    }

});
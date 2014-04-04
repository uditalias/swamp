"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    net                 = require('net');

module.exports = EventDispatcher.define({

    $config: {
        id: 'unixSocket',
        singleton: false,
        inject: ['env', 'utils', 'mainLoggersManager'],
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

        //process.umask(this._chmod);

        this._server.listen(this._path);

    },

    _onServerError: function(err) {

        var error = 'Unix socket file `{0}` error ({1})'.format(this._path, err);

        if(err.code == 'EACCES') {
            error += ' - try running Swamp with root permissions';
        }

        this.utils.log(error, this.utils.LOG_TYPE.ERROR, false, false, this.mainLoggersManager.getError());

        this.fireEvent('error', this.id);

    },

    _onServerListenStart: function() {

        //process.umask(this._processOriginalChmod);

        this._isRunning = true;

        this.utils.log('Unix socket file `{0}` established'.format(this._path), this.utils.LOG_TYPE.SUCCESS, false, false, this.mainLoggersManager.getOut());

        this.fireEvent('listening', this.id);
    },

    _onUnixSocketClientConnection: function(socket) {

    }

});
"use strict";
var EventDispatcher = require('appolo-express').EventDispatcher,
    child_process   = require('child_process');

module.exports = EventDispatcher.define({

    $config: {
        id: 'command',
        initMethod: 'initialize',
        properties: [
            {
                name: '_createLogger',
                factoryMethod: 'swampLogger'
            }
        ],
        inject: [ 'utils' ]
    },

    constructor: function (command, service) {

        this.id = _.guid();
        this._service = service;
        this._command = command;
        this._cmd = this._command.cmd;
        this._logger = null;
        this._process = null;
        this._disposed = false;
        this._success = false;

        this._options = {
            cwd: this._service.path
        };
    },

    initialize: function() {

        this._initializeLogger();

    },

    serialize: function() {

        return {
            id: this.id,
            commandId: this._command.id,
            serviceName: this._service.name,
            cmd: this._cmd,
            cwd: this._options.cwd,
            log: this._logger.getAll(),
            disposed: this._disposed,
            success: this._success
        };
    },

    run: function() {

        if(this._command && this._cmd) {

            this.fireEvent('started', this.id, this._command.id, this._service.name);

            this._process = child_process.exec(this._cmd, this._options);

            this._bindProcessEvents();
        }

    },

    terminate: function() {

        if(this._process) {
            this._process.kill();
        }

    },

    _bindProcessEvents: function() {

        if(this._process) {

            this._process.stdout.on('data', this._onProcessDataOut.bind(this));
            this._process.stderr.on('data', this._onProcessErrorOut.bind(this));

            this._process.on('exit', this._onProcessExitWithCode.bind(this));
            this._process.on('close', this._onProcessClose.bind(this));
            this._process.on('error', this._onProcessError.bind(this));
            this._process.on('uncaughtException', this._onProcessError.bind(this));
        }
    },

    _unbindProcessEvents: function() {

        if(this._process) {
            this._process.stdout.removeAllListeners('data');
            this._process.stderr.removeAllListeners('data');

            this._process.removeAllListeners('exit');
            this._process.removeAllListeners('close');
            this._process.removeAllListeners('error');
            this._process.removeAllListeners('uncaughtException');
        }
    },

    _onProcessDataOut: function(data) {
        this._logger.log('info', data);
    },

    _onProcessErrorOut: function(data) {
        this._logger.log('error', data);
    },

    _onProcessExitWithCode: function(exitCode, signal) {
        this._dispose(exitCode);
    },

    _onProcessClose: function() {
        this._dispose(1);
    },

    _onProcessError: function() {
        this._dispose(1);
    },

    _dispose: function(code) {

        if(!this._disposed) {
            this._disposed = true;

            this._success = code == 0;

            this._unbindProcessEvents();

            this.fireEvent('disposed', this.id, this._command.id, this._service.name, this._success);

            this._logger.un('log', this._onServiceLog, this);
        }
    },

    _initializeLogger: function() {
        this._logger = this._createLogger({}, true, false, -1, false, true);

        this._logger.on('log', this._onServiceLog, this);
    },

    _onServiceLog: function(logData) {
        this.fireEvent('stdout', this.id, this._command.id, this._service.name, logData);
    }
});
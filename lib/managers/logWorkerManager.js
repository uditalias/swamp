"use strict";
var Class           = require('appolo-express').Class,
    child_process   = require('child_process'),
    path            = require('path');

module.exports = Class.define({
    $config:{
        id: 'logWorkerManager',
        initMethod: 'initialize',
        singleton: true
    },

    constructor: function() {

        this._worker = null;

    },

    initialize: function() {

        this._createWorker();

    },

    createLog: function(data) {

        this._send({ event: 'create', payload: data });

    },

    log: function(data) {

        this._send({ event: 'log', payload: data });

    },

    dispose: function() {

        if(this._worker) {
            this._worker.kill();
        }

    },

    _send: function(data) {
        this._worker && this._worker.send(data);
    },

    _createWorker: function() {
        this._worker = child_process.fork(path.resolve(__dirname, '../../workers/logger.js'), [], {});
    }
});
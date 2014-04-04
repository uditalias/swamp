"use strict";
var Class       = require('appolo').Class,
    fs          = require('fs'),
    path        = require('path');

module.exports = Class.define({
    $config:{
        id: 'mainLoggersManager',
        singleton: true,
        properties: [
            {
                name: '_createLogger',
                factoryMethod: 'swampLogger'
            }
        ],
        inject: ['utils']
    },

    constructor: function() {
        this._loggers = null;
    },

    initialize: function(logs) {

        this._initializeLoggers(logs);

    },

    get: function() {
        return this._loggers;
    },

    getOut: function() {
        return this._loggers ? this._loggers.out : null;
    },

    getError: function() {
        return this._loggers ? this._loggers.err : null;
    },

    _initializeLoggers: function(logs) {

        var _logFilesPath = this._ensureLogFilesExist(logs);

        this._loggers = {
            out: this._createLogger({ filename: _logFilesPath.out, json: false }, true, 100),
            err: this._createLogger({ filename: _logFilesPath.err, json: false }, true, 100)
        }
    },

    _ensureLogFilesExist: function(logs) {

        this._createDefaultLogsFolder(logs);

        var _outLogPath = logs && logs.out ? logs.out : path.resolve(process.cwd(), 'logs/out.log');
        var _errorLogPath = logs && logs.err ? logs.err : path.resolve(process.cwd(), 'logs/err.log');

        var _outLogPathDir = path.dirname(_outLogPath);
        var _errorLogPathDir = path.dirname(_errorLogPath);

        this.utils.mkdir(_outLogPathDir);
        this.utils.mkdir(_errorLogPathDir);

        this.utils.mkfile(_outLogPath, 'a');

        this.utils.mkfile(_errorLogPath, 'a');

        return {
            out: _outLogPath,
            err: _errorLogPath
        }
    },

    _createDefaultLogsFolder: function(logs) {

        var _createDefault = true;

        if(logs) {
            if(logs.err && logs.out) {
                _createDefault = false;
            }
        }

        if(_createDefault) {
            this.utils.mkdir('logs');
        }

    }
});
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
        inject: ['utils', 'logOptionsParser']
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
        var _logFilesSize = this.logOptionsParser.getLogFilesSize(logs);

        this._loggers = {
            out: this._createLogger({ filename: _logFilesPath.out, json: false, maxSize: _logFilesSize.out }, true, 100),
            err: this._createLogger({ filename: _logFilesPath.err, json: false, maxSize: _logFilesSize.err }, true, 100)
        }
    },

    _ensureLogFilesExist: function(logs) {

        this.logOptionsParser.createDefaultLogsFolder(logs, 'logs');

        var _outLogPath = this.logOptionsParser.getLogPath(logs, 'out', 'logs');
        var _errorLogPath =  this.logOptionsParser.getLogPath(logs, 'err', 'logs');

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
    }
});
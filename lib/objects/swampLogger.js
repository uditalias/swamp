'use strict';
var EventDispatcher = require('appolo-express').EventDispatcher,
    winston = require('winston'),
    DateRotatingFileLogger = require('DateRotatingFileLogger');

module.exports = EventDispatcher.define({

    $config: {
        id: 'swampLogger',
        singleton: false,
        initMethod: 'initialize',
        inject: ['logWorkerManager', 'optionsManager']
    },

    constructor: function (options, saveLogsInMemory, saveLogsInFile, maxLogsToSave, includeTimestamp, useExternalProcess) {

        EventDispatcher.call(this);

        this._id = _.guid();
        this._logs = [];
        this._saveLogsInMemory = saveLogsInMemory;
        this._saveLogsInFile = saveLogsInFile;
        this._maxLogsToSave = maxLogsToSave;
        this._useExternalProcess = useExternalProcess || false;
        this._logger = null;

        if (saveLogsInFile) {
            this._includeTimestamp = includeTimestamp || false;
            this._options = options;

            //disable the log rotation file name timestamp
            this._options.timestamp = false;

            //maxsize option in bytes
            this._options.maxsize = options.maxSize;

            //the filename will always have the most recent log lines
            this._options.tailable = true;

            this._options.handleExceptions = function () {};
        }
    },

    initialize: function () {

        if (this._saveLogsInFile) {

            if (this._useExternalProcess) {
                this.logWorkerManager.createLog({
                    id: this._id,
                    options: this._options
                });
            } else {
                this._logger = new (DateRotatingFileLogger)(this._options);
            }
        }
    },

    log: function (type, text, params) {

        if (this.optionsManager.getOptions().silence) {
            return {};
        }

        var now = new Date();

        var logObj = {time: now, text: text};

        if (this._saveLogsInMemory) {

            this._save(logObj);

        }

        if (this._saveLogsInFile) {
            var args = [type, text, params];

            if (this._includeTimestamp) {
                args.unshift(now.toISOString());
            }

            if (this._useExternalProcess) {
                this.logWorkerManager.log({
                    id: this._id,
                    args: args
                });
            } else {
                this._logger.log.apply(this._logger, args);
            }
        }

        this.fireEvent('log', logObj);

        return logObj;

    },

    getAll: function () {

        return this._logs;

    },

    clear: function () {

        this._logs.length = 0;

    },

    _save: function (logObj) {

        this._logs.push(logObj);

        if (this._logs.length > this._maxLogsToSave && this._maxLogsToSave > -1) {

            this._logs.shift();

        }

    }

});
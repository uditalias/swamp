'use strict';
var EventDispatcher = require('appolo-express').EventDispatcher;

module.exports = EventDispatcher.define({

    $config: {
        id: 'swampLogger',
        singleton: false,
        initMethod: 'initialize',
        inject: ['logWorkerManager', 'optionsManager']
    },

    constructor: function(options, saveLogsInMemory, saveLogsInFile, maxLogsToSave, includeTimestamp) {

        EventDispatcher.call(this);

        this._id = _.guid();
        this._logs = [];
        this._saveLogsInMemory = saveLogsInMemory;
        this._saveLogsInFile = saveLogsInFile;
        this._maxLogsToSave = maxLogsToSave;

        if(saveLogsInFile) {
            this._includeTimestamp = includeTimestamp || false;
            this._options = options;

            //disable the log rotation file name timestamp
            this._options.timestamp = false;

            //maxsize option in bytes
            this._options.maxsize = options.maxSize;
        }
    },

    initialize: function() {

        if(this._saveLogsInFile) {

            this.logWorkerManager.createLog({
                id: this._id,
                options: this._options
            });

        }
    },

    log: function(type, text, params) {

        if(this.optionsManager.getOptions().silence) {
            return {};
        }

        var now = new Date();

        var logObj = { time: now, text: text };

        if(this._saveLogsInMemory) {

            this._save(logObj);

        }

        if(this._saveLogsInFile) {
            var args = [ type, text, params ];

            if(this._includeTimestamp) {
                args.unshift(now.toISOString());
            }

            this.logWorkerManager.log({
                id: this._id,
                args: args
            });
        }

        this.fireEvent('log', logObj);

        return logObj;

    },

    getAll: function() {

        return this._logs;

    },

    clear: function() {

        this._logs.length = 0;

    },

    _save: function(logObj) {

        this._logs.push(logObj);

        if(this._logs.length > this._maxLogsToSave && this._maxLogsToSave > -1) {

            this._logs.shift();

        }

    }


});
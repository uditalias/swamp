'use strict';
var EventDispatcher = require('appolo').EventDispatcher;

module.exports = EventDispatcher.define({

    $config: {
        id: 'swampLogger',
        singleton: false,
        initMethod: 'initialize',
        inject: ['logWorkerManager']
    },

    constructor: function(options, saveLogs, maxLogsToSave, includeTimestamp) {

        EventDispatcher.call(this);

        this._id = _.guid();
        this._logs = [];
        this._saveLogs = saveLogs;
        this._maxLogsToSave = maxLogsToSave;
        this._includeTimestamp = includeTimestamp || false;
        this._options = options;

        //disable the log rotation file name timestamp
        this._options.timestamp = false;

        //maxsize option in bytes
        this._options.maxsize = options.maxSize;

    },

    initialize: function() {

        this.logWorkerManager.createLog({
            id: this._id,
            options: this._options
        });

    },

    log: function(type, text, params) {

        var now = new Date();

        var logObj = { time: now, text: text };

        if(this._saveLogs) {

            this._save(logObj);

        }

        var args = [ type, text, params ];

        if(this._includeTimestamp) {
            args.unshift(now.toISOString());
        }

        this.logWorkerManager.log({
            id: this._id,
            args: args
        });

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

        if(this._logs.length > this._maxLogsToSave) {

            this._logs.shift();

        }

    }


});
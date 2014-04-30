'use strict';
var EventDispatcher     = require('appolo').EventDispatcher,
    winston             = require('winston'),
    FileRotateDate      = require('winston-filerotatedate');

module.exports = EventDispatcher.define({

    $config: {
        id: 'swampLogger',
        singleton: false,
        inject: []
    },

    constructor: function(options, saveLogs, maxLogsToSave) {

        EventDispatcher.call(this);

        this._logs = [];
        this._saveLogs = saveLogs;
        this._maxLogsToSave = maxLogsToSave;

        options.timestamp = false;
        options.maxsize = _.unhumanizeSize(options.maxSize || '1M');

        this._logger = new (winston.transports.FileRotateDate)(options);

    },

    log: function(type, text, params) {

        var logObj = { time: new Date(), text: text };

        if(this._saveLogs) {

            this._save(logObj);

        }

        this._logger.log.apply(this._logger, arguments);

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
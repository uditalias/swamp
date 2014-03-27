'use strict';
var Class           = require('appolo').Class,
    winston         = require('winston');

module.exports = Class.define({

    $config: {
        id: 'swampLogger',
        singleton: false,
        inject: []
    },

    constructor: function(options, saveLogs, maxLogsToSave) {

        this._logs = [];
        this._saveLogs = saveLogs;
        this._maxLogsToSave = maxLogsToSave;

        this._logger = new (winston.transports.File)(options);

    },

    log: function(type, text, params) {

        if(this._saveLogs) {

            this._save(text);

        }

        this._logger.log.apply(this._logger, arguments);

    },

    getAll: function() {

        return this._logs;

    },

    clear: function() {

        this._logs.length = 0;

    },

    _save: function(text) {

        this._logs.push({ time: new Date(), text: text });

        if(this._logs.length > this._maxLogsToSave) {

            this._logs.shift();

        }

    }


});
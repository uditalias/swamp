'use strict';
var Class           = require('appolo').Class,
    winston         = require('winston');

module.exports = Class.define({

    $config: {
        id: 'swampLogger',
        singleton: false,
        inject: []
    },

    constructor: function(options) {

        this._logger = new (winston.transports.File)(options);

    },

    log: function(type, text, params) {

        this._logger.log.apply(this._logger, arguments);

    }


});
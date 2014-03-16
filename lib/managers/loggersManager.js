"use strict";
var winston     = require('winston'),
    Class       = require('appolo').Class;

module.exports = Class.define({
    $config: {
        id: 'loggersManager',
        singleton: true,
        inject: ['env']
    }

   /* transports.push(new (winston.transports.File)({
        filename:''
    }));


var logger = new (winston.Logger)({
    transports: transports,
    exitOnError: false
});*/

});
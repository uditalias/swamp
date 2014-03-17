"use strict";
var Class   = require('appolo').Class;

module.exports = Class.define({
    $config:{
        id: 'loggerFactory',
        singleton: true,
        inject: ['env']
    },

    create: function(options) {

        /* transports.push(new (winston.transports.File)({
         filename:''
         }));


         var logger = new (winston.Logger)({
         transports: transports,
         exitOnError: false
         });*/


    }
});
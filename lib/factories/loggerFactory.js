"use strict";
var Class   = require('appolo').Class;

module.exports = Class.define({
    $config:{
        id: 'loggerFactory',
        singleton: true,
        inject: ['env']
    },

    create: function() {


    }
});
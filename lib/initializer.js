"use strict";

var Class    = require('appolo').Class,
    _        = require('lodash'),
    Q        = require('q');

module.exports = Class.define({
    $config: {
        id: 'initializer',
        singleton: true,
        inject: ['env']
    },

    initialize: function () {

    },

    config: function(conf) {

        console.log(conf);

    }



});
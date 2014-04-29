"use strict";

var appolo      = require('appolo'),
    Class       = appolo.Class,
    Q           = require('q');

module.exports = Class.define({
    $config: {
        id: 'propertiesService',
        singleton: true,
        inject: [ 'env' ]
    },

    _propStringTmplRe: /^<%=\s*([a-z0-9_$]+(?:\.[a-z0-9_$]+)*)\s*%>$/i,

    process: function(rawData) {

        return rawData;

    }
});
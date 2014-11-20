"use strict";

var appolo      = require('appolo-express'),
    Class       = appolo.Class,
    Q           = require('q');

module.exports = Class.define({
    $config: {
        id: 'propertiesService',
        singleton: true,
        inject: [ 'env' ]
    },

    _propRegex: /\\*<%=\s*([a-z0-9_$]+(?:\.[a-z0-9_$]+)*)\s*%>\\*/gi,

    process: function(rawData) {

        _.everything(rawData, this._onEachProperty.bind(this, rawData));

    },

    _onEachProperty: function(source, value) {

        if(typeof value !== 'string') {

            return value;

        }

        var matches = value.match(this._propRegex);

        if(matches) {

            for(var i = 0, len = matches.length; i < len; i++) {

                var prop = matches[i].replace('<%=', '').replace('%>', '').trim();

                var realValue = _.namespaceValue(source, prop);

                value = value.replace(matches[i], realValue);

            }

        }

        return value;

    }
});
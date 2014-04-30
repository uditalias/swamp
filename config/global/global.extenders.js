"use strict";
var _ = global._ = require('lodash');


global.String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}

function _everything(source, callback) {

    if(typeof source === 'object' || source instanceof Array) {

        _.forEach(source, function(_value, _key) {

            source[_key] = _everything(source[_key], callback);

        });

    } else {

        return callback(source);

    }

    return source;

}

_.mixin({ 'everything': _everything });

function _namespaceValue(source, namespace) {

    var keys = namespace.split('.');

    var anchor = source;

    _.forEach(keys, function(value) {

        try {

            anchor = anchor[value];

        } catch (e) {

            anchor = '';

        }

    });

    return anchor;
}

_.mixin({ 'namespaceValue': _namespaceValue });
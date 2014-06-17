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


function _unhumanizeSize(text) {
    var powers = {'k': 1, 'm': 2, 'g': 3, 't': 4};
    var regex = /(\d+(?:\.\d+)?)\s*(k|m|g|t)?b?/i;

    var res = regex.exec(text);

    return res[1] * Math.pow(1024, powers[res[2].trim().toLowerCase()]);
}

_.mixin({ 'unhumanizeSize': _unhumanizeSize });


function _guid(){
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
}

_.mixin({ 'guid': _guid});
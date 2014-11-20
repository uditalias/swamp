"use strict";
var EventDispatcher     = require('appolo-express').EventDispatcher,
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'swampEnvironment',
        singleton: false,
        inject: []
    },

    constructor:function(params){
        this._params = {};
        this.name = '';

        this._initialize(params);
    },

    _initialize: function(params) {

        var self = this;

        this._params['NODE_ENV'] = this.name = params.name || params.NODE_ENV;

        _.forEach(params, function(value, key) {
            if(key != 'name' && key != 'NODE_ENV') {
                self._params[key] = value;
            }
        });

    },

    get: function(key) {
        return this._params[key] || null;
    },

    toJSON: function() {
        return _.clone(this._params, true);
    },

    merge: function(envParams) {
        this._params = _.extend(envParams, this._params);
    }
});
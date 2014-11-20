"use strict";

var appolo      = require('appolo-express'),
    Class       = appolo.Class,
    Q           = require('q');

module.exports = Class.define({
    $config: {
        id: 'configurationsManager',
        initMethod: 'initialize',
        singleton: true,
        inject: ['db']
    },

    initialize: function() {

        this.jwtsecret = null;
        this.sessionMaxAge = null;

        this._initializeConfigurationFields();
    },

    get: function(key) {

        if(this[key]) {
            return this[key];
        }

        var config = this.db.configurations.findOne({ key: key });

        if(config) {
            return config.value;
        }
    },

    set: function(key, value) {

        var configuration = {
            key: key,
            value: value
        };

        this.db.configurations.save(configuration);

        return configuration;
    },

    _initializeConfigurationFields: function() {

        var jwtsecret = this.get('jwtsecret');

        if(!jwtsecret) {
            jwtsecret = this.set('jwtsecret', _.secret(10));
        }

        this.jwtsecret = jwtsecret.value;

        var sessionMaxAge = this.get('sessionMaxAge');

        if(!sessionMaxAge) {
            sessionMaxAge = this.set('sessionMaxAge', 1000*60*60*24*7);
        }

        this.sessionMaxAge = sessionMaxAge.value;

    }
});
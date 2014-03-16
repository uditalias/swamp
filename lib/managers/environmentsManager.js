"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'environmentsManager',
        singleton: true,
        properties: [
            {
                name: '_createEnvironment',
                factoryMethod: 'swampEnvironment'
            }
        ],
        inject: ['env']
    },

    constructor:function(){
        this._environments = {};
    },

    initialize: function (environments) {

        _.forEach(environments || [], this._onEachEnvironment.bind(this));

    },

    createMergedEnvironment: function(env) {

        var environment = this._createEnvironment(env);

        var globalEnv = this._environments[environment.name];

        if(globalEnv) {
            environment.merge(globalEnv.toJSON());
        }

        return environment;
    },

    getAll: function() {
        return this._environments;
    },

    getByName: function(envName) {
        return this._environments[envName] || null;
    },

    _onEachEnvironment: function(env) {

        var environment = this._createEnvironment(env);

        this._environments[environment.name] = environment;

    }
});
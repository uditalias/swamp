"use strict";
var EventDispatcher     = require('appolo').EventDispatcher,
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'optionsManager',
        singleton: true,
        inject: ['env']
    },

    constructor:function(){
        this._options = {};
    },

    initialize: function (options) {

        var defaultOptions = this._getDefaultOptions();

        this._options = _.extend(defaultOptions, options || {});
    },

    getOptions: function() {
        return this._options;
    },

    _getDefaultOptions: function() {
        return {
            "monitor": {
                "cpu": true,
                "memory": true
            },
            "dashboard": {
                "port": 2121,
                "autoLaunch": false,
                "credentials": {
                    "username": "",
                    "password": ""
                }
            }
        };
    }
});
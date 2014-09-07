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

        this._modes = ['local', 'remote'];
    },

    initialize: function (options) {

        var defaultOptions = this._getDefaultOptions();

        this._options = _.extend(defaultOptions, options || {});

        this._options.mode = this._modes.indexOf(this._options.mode) > -1 ? this._options.mode : 'local';
    },

    getOptions: function() {
        return this._options;
    },

    _getDefaultOptions: function() {
        return {
            "mode": "local",
            "monitor": {
                "cpu": true,
                "memory": true
            },
            "dashboard": {
                "hostname": "localhost",
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
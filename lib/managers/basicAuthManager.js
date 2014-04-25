'use strict';

var appolo              = require('appolo'),
    EventDispatcher     = appolo.EventDispatcher;

module.exports = EventDispatcher.define({
    $config: {
        id: 'basicAuthManager',
        singleton: true,
        initMethod: 'initialize',
        inject: ['env', 'optionsManager']
    },

    initialize: function() {

    },

    getBasicAuthMiddleware: function() {

        var credentials = this.optionsManager.getOptions().dashboard.credentials;

        return function(username, password) {

            for(var i = 0, len = credentials.length; i < len; i++) {

                if(credentials[i].username == username && credentials[i].password == password) {

                    return true;

                }

            }

            return false;

        }

    }
});
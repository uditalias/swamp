"use strict";
var appolo              = require('appolo'),
    EventDispatcher     = appolo.EventDispatcher,
    _                   = require('lodash'),
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'dashboardManager',
        singleton: true,
        inject: ['env', 'utils', 'optionsManager']
    },

    launch: function () {

        this._launchWebServer();

    },

    _launchWebServer: function() {

        var port = this.optionsManager.getOptions().dashboard.port;
        var credentials = this.optionsManager.getOptions().dashboard.credentials || {};
        var message = "Dashboard running and listening to port {0}".format(port);

        appolo.launcher.startServer(port, credentials, message, this._onServerListenStart.bind(this));
    },

    _onServerListenStart: function() {

        if(this.optionsManager.getOptions().dashboard.autoLaunch) {
            this.open();
        }

    },

    open: function() {
        var url = 'http://localhost:{0}/'.format(this.optionsManager.getOptions().dashboard.port);

        this.utils.log('\r\nRunning dashboard ({0})'.format(url));

        this.utils.openUrl(url);
    }
});
"use strict";
var appolo  = require('appolo-express');

module.exports = function(callback) {
    appolo.launcher.launch({
        paths: [ 'config', 'lib' ],
        viewsEngine: 'ejs',
        viewsFolder: '/dashboard/views',
        publicFolder: '/dashboard/public',
        root: __dirname,
        startServer: false,
        startMessage: "Swamp dashboard listening to port {0}",
        environment: 'production'
    }, function() {
        callback && callback(appolo);
    });
};
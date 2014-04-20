"use strict";
var appolo  = require('appolo');

appolo.launcher.launch({
    paths: [ 'config', 'lib' ],
    viewsEngine: 'ejs',
    viewsFolder: '/dashboard/views',
    publicFolder: '/dashboard/public',
    root: __dirname,
    runServer: false
});

module.exports.appolo = appolo;
"use strict";
var appolo  = require('appolo');

appolo.launcher.launch({
    paths: [ 'config', 'lib' ],
    viewsEngine: 'ejs',
    viewsFolder: '/lib/views',
    publicFolder: '/lib/public',
    root: __dirname,
    runServer: false
});

module.exports.appolo = appolo;
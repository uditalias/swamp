"use strict";
var appolo  = require('appolo');

appolo.launcher.launch({ paths: ['lib'], viewsEngine: 'ejs', viewsFolder: '/lib/views' });

module.exports.appolo = appolo;
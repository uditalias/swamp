"use strict";
var db      = require('diskdb'),
    path    = require('path'),
    appolo  = require('appolo-express');

module.exports = function (options) {

    return function (env, inject, app, callback) {

        var databaseConnection = db.connect(path.resolve(__dirname, '..', '..', '..', 'db'), env.databaseCollections);

        inject.addObject('db', databaseConnection);

        callback();
    }
};
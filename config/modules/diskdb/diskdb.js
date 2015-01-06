"use strict";
var db      = require('diskdb'),
    path    = require('path'),
    fs      = require('fs'),
    appolo  = require('appolo-express');

module.exports = function (options) {

    return function (env, inject, app, callback) {

        var dbPath = path.resolve(process.cwd(), '.db');

        if(!fs.existsSync(dbPath) || !fs.lstatSync(dbPath).isDirectory()) {
            fs.mkdirSync(dbPath);
        }

        var databaseConnection = db.connect(dbPath, env.databaseCollections);

        inject.addObject('db', databaseConnection);

        callback();
    }
};
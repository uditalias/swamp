"use strict";
var appolo = require('appolo-express');

module.exports = function (app) {
    app.use(function(req, res,next) {

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");

        if ('OPTIONS' == req.method) return res.sendStatus(200);
        next();
    });
};
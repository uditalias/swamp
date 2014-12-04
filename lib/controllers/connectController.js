"use strict";
var appolo = require('appolo-express'),
    fs  = require('fs'),
    Q = require('q');

module.exports = appolo.Controller.define({

    $config: {
        id: 'connectController',
        inject: ['env']
    },

    get: function (req, res) {

        res.render('connect.ejs', this._getViewParams());

    },

    _getViewParams: function() {
        return {

        };
    }
});
"use strict";
var appolo = require('appolo'),
    fs  = require('fs'),
    Q = require('q');

module.exports = appolo.Controller.define({

    $config: {
        id: 'ioStreamController',
        inject: ['env']
    },

    get: function (req, res) {

        res.render('ioStream', this._getViewParams());

    },

    _getViewParams: function() {

        return {

        };

    }
});
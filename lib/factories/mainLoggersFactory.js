"use strict";
var Class       = require('appolo').Class,
    path        = require('path');

module.exports = Class.define({
    $config:{
        id: 'mainLoggersFactory',
        singleton: true,
        injectorAware:true,
        properties: [
            {
                name: '_createLogger',
                factoryMethod: 'swampLogger'
            }
        ],
        inject: ['utils']
    },

    constructor: function() {
        this._loggers = null;
    },

    get:function(){

        this._initializeLoggers();

        return this._loggers;
    },

    _initializeLoggers: function() {
        if(!this._loggers) {

            //ensure log files exists
            this.utils.mkdir('logs');
            this.utils.mkfile('logs/out.log', 'w');
            this.utils.mkfile('logs/err.log', 'w');

            this._loggers = {
                out: this._createLogger({ filename: path.resolve(process.cwd(), 'logs/out.log'), json: false }, true, 100),
                err: this._createLogger({ filename: path.resolve(process.cwd(), 'logs/err.log'), json: false }, true, 100)
            }
        }
    }


});
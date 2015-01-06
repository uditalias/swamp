"use strict";
var EventDispatcher = require('appolo-express').EventDispatcher;

module.exports = EventDispatcher.define({

    $config: {
        id: 'preset'
    },

    constructor: function (preset) {
        this.id = preset._id || _.guid();
        this._name = preset.name;
        this._services = preset.services;
        this._inStorage = preset.in_storage;
    },

    serialize: function() {

        return {
            id: this.id,
            name: this._name,
            services: this._services,
            inStorage: this._inStorage
        };

    },

    isInStorage: function() {
        return this._inStorage;
    },

    getName: function() {
        return this._name;
    },

    getServices: function() {
        return this._services;
    }
});
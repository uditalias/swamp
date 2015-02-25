"use strict";
var EventDispatcher = require('appolo-express').EventDispatcher;

module.exports = EventDispatcher.define({

    $config: {
        id: 'cliClient',
        initMethod: 'initialize',
        inject: ['utils']
    },

    _END_DELIMITER: '[=!=SWAMP_DATA_END=!=]',

    constructor: function (socket) {
        this._socket = socket;
    },

    initialize: function () {

        this._id = this.utils.guid();

        this._socket.on('data', this._onSocketData.bind(this));
        this._socket.on('end', this._onSocketDisconnect.bind(this));

    },

    sendMessage: function (message) {

        try {

            message = JSON.stringify(message);

            message += this._END_DELIMITER;

            this._socket.write(message);

        } catch (e) {}

    },

    getSocketId: function () {
        return this._id;
    },

    _onSocketData: function (data) {
        try {

            var json = JSON.parse(data);

            this._processData(json);

        } catch (e) {}
    },

    _onSocketDisconnect: function () {

        this.fireEvent('disconnect', this);

    },

    _processData: function (obj) {

        obj = obj || {};

        if (!obj.event) {
            return;
        }

        this.fireEvent(obj.event, obj, this);
    }
});
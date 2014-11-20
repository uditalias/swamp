"use strict";
var sio     = require('socket.io'),
    appolo  = require('appolo-express');

module.exports = function (options) {

    return function (env, inject, app, callback) {

        var io = sio.listen(app.server);

        function _authorization(handshake, accept) {
            var access_token = handshake.query['x-access-token'] || handshake.headers['x-access-token'];
            var authorizationMiddleware = appolo.inject.delegate('authorizationMiddleware');

            authorizationMiddleware(access_token, accept.bind(this, null, true), accept.bind(this, null, false));
        }

        io.enable('browser client minification');
        io.enable('browser client etag');
        io.enable('browser client gzip');
        io.set('authorization', _authorization);
        io.set('log level', 0);

        inject.addObject('io', io);

        callback();
    }
};
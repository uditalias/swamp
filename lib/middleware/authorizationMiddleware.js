"use strict";
var Class   = require('appolo-express').Class,
    moment  = require('moment'),
    jwt     = require('jsonwebtoken'),
    Q       = require('q');

module.exports = Class.define({
    $config: {
        id: 'authorizationMiddleware',
        singleton: false,
        inject: ['configurationsManager', 'sessionsManager']
    },

    run: function (accessToken, success, fail) {

        if(!accessToken) return fail();

        var secret = this.configurationsManager.get('jwtsecret');
        var sessionMaxAge = this.configurationsManager.get('sessionMaxAge');

        this._verifyToken(accessToken, secret)
            .then(this._validateTokenExpiration.bind(this, accessToken, sessionMaxAge))
            .then(this._touchSession.bind(this))
            .then(function() {
                success();
            })
            .fail(function() {
                fail();
            });
    },

    _verifyToken: function(accessToken, secret) {

        var deferred = Q.defer();

        jwt.verify(accessToken, secret, function(err, decoded) {
            if(err) {
                deferred.reject();
            } else {
                deferred.resolve(decoded);
            }
        });

        return deferred.promise;
    },

    _validateTokenExpiration: function(accessToken, sessionMaxAge, tokenData) {

        var session = this.sessionsManager.get(accessToken);

        if(!session) {
            throw new Error('SESSION_EXPIRED');
        }

        if(moment.utc().unix() - session.lastTouch > sessionMaxAge && !session.connect) {
            this.sessionsManager.remove(session.accessToken);
            throw new Error('SESSION_EXPIRED');
        }

        return session;
    },

    _touchSession: function(session) {

        return this.sessionsManager.touch(session);

    }
});
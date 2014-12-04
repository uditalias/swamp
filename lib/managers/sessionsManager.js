"use strict";

var appolo      = require('appolo-express'),
    Class       = appolo.Class,
    moment      = require('moment'),
    jwt         = require('jsonwebtoken'),
    Q           = require('q');

module.exports = Class.define({
    $config: {
        id: 'sessionsManager',
        initMethod: 'initialize',
        singleton: true,
        inject: ['db', 'configurationsManager'],
        statics: {
            SESSION_COLLECTOR_INTERVAL: 1000*60*60
        }
    },

    initialize: function() {

        this._sessionCollector();

    },

    get: function(accessToken) {
        return this.db.sessions.findOne({ accessToken: accessToken });
    },

    set: function(session) {

        this.db.sessions.update({ accessToken: session.accessToken }, session, { upsert: true });

        return session;
    },

    remove: function(accessToken) {

        this.db.sessions.remove({ accessToken: accessToken }, false);

    },

    touch: function(session) {
        session.lastTouch = moment.utc().unix();
        return this.set(session);
    },

    create: function(isConnect) {

        var utcUnixNow = moment.utc().unix();
        var secret = this.configurationsManager.get('jwtsecret');

        var session = {
            accessToken: jwt.sign({ timestamp: utcUnixNow }, secret),
            lastTouch: utcUnixNow,
            connect: isConnect
        };

        this.set(session);

        return session;

    },

    _sessionCollector: function() {

        var allSessions = this.db.sessions.find();
        var sessionMaxAge = this.configurationsManager.get('sessionMaxAge');

        _.forEach(allSessions, function(session) {

            if(moment.utc().unix() - session.lastTouch > sessionMaxAge && !session.connect) {
                this.remove(session.accessToken);
            }

        }.bind(this));

        setTimeout(this._sessionCollector.bind(this), this.SESSION_COLLECTOR_INTERVAL);

    }
});
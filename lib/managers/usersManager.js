"use strict";
var EventDispatcher = require('appolo-express').EventDispatcher,
    jwt             = require('jsonwebtoken'),
    Q               = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'usersManager',
        singleton: true,
        inject: ['sessionsManager']
    },

    constructor: function() {
        this._users = {};
    },

    initialize: function(users) {

        _.forEach(users, function(user) {

            user.id = _.guid();
            this._users[user.id] = user;

        }.bind(this));

    },

    login: function(username, password, isConnect) {

        return this.findUserByField('username', username)
            .then(this._comparePasswords.bind(this, password))
            .then(this._createSession.bind(this, isConnect));

    },

    findById: function (id) {
        var deferred = Q.defer();

        if(this._users[id]) {
            deferred.resolve(this._users[id]);
        } else {
            deferred.reject();
        }

        return deferred.promise;
    },

    findUserByField: function (field, value) {

        var deferred = Q.defer();

        var user = null;

        for(var id in this._users) {
            if(this._users[id][field] == value) {
                user = this._users[id];
                break;
            }
        }

        if(user) {
            deferred.resolve(user);
        } else {
            deferred.reject("INVALID_CREDENTIALS");
        }

        return deferred.promise;
    },

    _comparePasswords: function(password, user) {

        if(password == user.password) {
            return user;
        }

        throw "INVALID_CREDENTIALS";
    },

    _createSession: function(isConnect, user) {
        return this.sessionsManager.create(isConnect);
    }
});
"use strict";
var Class           = require('appolo-express').Class,
    Q               = require('q'),
    execFile        = require('child_process').execFile;

module.exports = Class.define({

    $config: {
        id: 'userResolverService',
        singleton: true,
        inject: [ 'env' ]
    },

    _cache: {},

    resolveUserIdByUsername: function(username) {

        var deferred = Q.defer();

        if(this._cache[username]) {

            deferred.resolve(username);

            return deferred.promise;
        }

        var script_runner = require.resolve('../../scripts/getuid.js');

        execFile(process.execPath, [ script_runner, username ], this._onUserIdResolved.bind(this, deferred, username));

        return deferred.promise;
    },

    _onUserIdResolved: function(deferred, username, code, out, stderr) {
        if(code) {
            var err = new Error("could not resolve uid\n" + stderr)
            err.code = code;
            deferred.reject(err);
            return;
        }

        try {
            out = JSON.parse(out + "")
        } catch (err) {
            deferred.reject(err);
            return;
        }

        if (out.err) {
            var err = new Error(out.err);
            deferred.reject(err);
            return;
        }

        this._cache[username] = out.uid;

        deferred.resolve(out.uid);

    }

});
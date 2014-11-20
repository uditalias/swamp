var appolo = require('appolo-express');

module.exports = appolo.Middleware.define({
    $config: {
        id: 'userAuthMiddleware',
        inject: ['env']
    },

    run: function(req, res, next) {
        var access_token = req.headers['x-access-token'];
        var authorizationMiddleware = appolo.inject.delegate('authorizationMiddleware');

        authorizationMiddleware(access_token, next, this._onAuthorizationFailure.bind(this, res));
    },

    _onAuthorizationFailure: function(res) {

        res.status(401).send("Unauthorized");
    }
});
var appolo      = require('appolo-express'),
    _           = require('lodash');


module.exports = appolo.Controller.define({
    $config: {
        id: 'authController',
        inject: ['env', 'usersManager', 'sessionsManager'],
        routes: [
            {
                path: "/api/auth/login/",
                method: 'get',
                controller: 'auth',
                action: 'isLoggedIn',
                middleware: ['userAuthMiddleware']
            },
            {
                path: "/api/auth/login/",
                method: 'post',
                controller: 'auth',
                action: 'login'
            },
            {
                path: "/api/auth/connect/",
                method: 'post',
                controller: 'auth',
                action: 'connect'
            },
            {
                path: "/api/auth/logout/",
                method: 'post',
                controller: 'auth',
                action: 'logout',
                middleware: ['userAuthMiddleware']
            },
            {
                path: "/api/auth/disconnect/",
                method: 'post',
                controller: 'auth',
                action: 'logout',
                middleware: ['userAuthMiddleware']
            }
        ]
    },

    isLoggedIn: function(req, res){
        this.sendOk({});
    },

    login: function (req, res) {

        var username = req.body.username,
            password = req.body.password;

        this.usersManager.login(username, password)
            .then(this.sendOk.bind(this))
            .fail(this.sendBadRequest.bind(this));

    },

    connect: function (req, res) {

        var username = req.body.username,
            password = req.body.password;

        this.usersManager.login(username, password, true)
            .then(this.sendOk.bind(this))
            .fail(this.sendBadRequest.bind(this));

    },

    logout: function (req, res) {
        var accessToken = req.headers['x-access-token'];

        this.sessionsManager.remove(accessToken);

        this.sendOk();

    }
});

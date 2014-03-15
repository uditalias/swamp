var sio = require('socket.io'),
    appolo = require('appolo');

appolo.app.configure("all", function () {

    var io = sio.listen(appolo.app.server);

    io.configure(function () {

        io.enable('browser client minification');
        io.enable('browser client etag');
        io.enable('browser client gzip');
        io.set('log level', 0);
    });

    appolo.inject.addObject('io', io);
});
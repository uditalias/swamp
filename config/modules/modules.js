
var appolo = require('appolo-express'),
    diskdb = require('./diskdb/diskdb'),
    io     = require('./socket.io/socket.io');


appolo.use(diskdb());
appolo.use(io());
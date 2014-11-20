var winston             = require('winston'),
    path                = require('path'),
    version             = require(path.resolve(__dirname, '../package.json')).version,
    FileRotateDate      = require('winston-filerotatedate');

var logs = {};

process.title = "swamp " + version + ' log worker';

process.on("SIGINT", function() { });

function _onMessage(msg) {

    if(!msg || !msg.event) return;

    switch(msg.event) {
        case 'create':
            _createLog(msg.payload);
            break;
        case 'log':
            _log(msg.payload);
            break;
    }
}

function _createLog(data) {

    logs[data.id] = new (winston.transports.FileRotateDate)(data.options);

}

function _log(data) {

    if(logs[data.id] && logs[data.id].log) {

        logs[data.id].log.apply(logs[data.id], data.args);

    }
}

process.on('message', _onMessage);
var winston             = require('winston'),
    path                = require('path'),
    version             = require(path.resolve(__dirname, '../package.json')).version;

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

    data.options.handleExceptions = handleExceptions;

    logs[data.id] = new (winston.transports.DailyRotateFile)(data.options);

}

function _log(data) {

    if(logs[data.id] && logs[data.id].log) {

        logs[data.id].log.apply(logs[data.id], data.args);

    }
}

function handleExceptions() {
}

process.on('uncaughtException', _onUncaughtException);

function _onUncaughtException(err) {
    if(err){
        err = err.stack ? err.stack : err.toString();
    }

    process.send({ err: err  });
}

process.on('message', _onMessage);
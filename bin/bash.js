"use strict";

var net                     = require('net'),
    colors                  = require('colors'),
    CLI_UNIX_SOCKET_FILE    = "swamp_cli.sock",
    END_DELIMITER           = "[=!=SWAMP_DATA_END=!=]";

var conn    = null,
    buffer  = '';

module.exports.executeCommand = function(command, service_name) {

    _initializeSocketConnection(function() {

        switch(command) {
            case 'stop':
                _stopService(service_name);
                break;
            case 'start':
                _startService(service_name);
                break;
            case 'restart':
                _restartService(service_name);
                break;
            case 'state':
                _serviceState(service_name);
                break;
            case 'startall':
                _startAllServices();
                break;
            case 'stopall':
                _stopAllServices();
                break;
            case 'restartall':
                _restartAllServices();
                break;
        }

    });

}

function _initializeSocketConnection(onConnect) {

    conn = net.createConnection(CLI_UNIX_SOCKET_FILE);

    conn.on('connect', onConnect);

    conn.on('data', _onSocketData);
}

function _broadcast(data) {

    if(conn && data) {

        conn.write(JSON.stringify(data));

    }
}

function _onSocketData(data) {

    if(data.toString().indexOf(END_DELIMITER) > -1) {

        buffer += data.toString().replace(END_DELIMITER, '');

        try {

            var json = JSON.parse(buffer.toString());

            _processData(json);

            conn.end();

        } catch(e) { }

        buffer = '';

    } else {
        buffer += data.toString();
    }

}

function _processData(data) {
    console.log(('* ' + data.data.msg)[data.data.type == 'error' ? 'red' : 'green']);

    conn.end();
}

function _startService(service_name) {

    _broadcast({ event: 'service.start', data: service_name });

}

function _restartService(service_name) {

    _broadcast({ event: 'service.restart', data: service_name });

}

function _serviceState(service_name) {

    _broadcast({ event: 'service.state', data: service_name });

}

function _stopService(service_name) {

    _broadcast({ event: 'service.stop', data: service_name });

}

function _startAllServices() {

    _broadcast({ event: 'swamp.startAll' });

}

function _stopAllServices() {

    _broadcast({ event: 'swamp.stopAllRunning' });

}

function _restartAllServices() {

    _broadcast({ event: 'swamp.restartAllRunning' });

}
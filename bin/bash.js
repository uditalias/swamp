"use strict";

var net                             = require('net'),
    colors                          = require('colors'),
    utils                           = require('./helper'),
    CLI_UNIX_SOCKET_FILE            = "swamp_cli.sock",
    WAIT_FOR_SOCK_FILE_MAX_RETRIES  = 10,
    WAIT_FOR_SOCK_FILE_INTERVAL     = 100,
    END_DELIMITER                   = "[=!=SWAMP_DATA_END=!=]";

var conn        = null,
    buffer      = '',
    event       = '',
    _deferred   = null;

function _getBaseDir() {
    return process.cwd();
}

function _getSOCKFile() {
    return _getBaseDir() + '/' + CLI_UNIX_SOCKET_FILE;
}

function _waitForSockFile(success, fail, retries) {

    retries = retries || 1;

    if(utils.fileExist(_getSOCKFile())) {

        success();

    } else {

        if(retries >= WAIT_FOR_SOCK_FILE_MAX_RETRIES) {

            fail();

        } else {

            setTimeout(function() {

                _waitForSockFile(success, fail, retries++);

            }, WAIT_FOR_SOCK_FILE_INTERVAL);

        }
    }
}

module.exports.executeCommand = function(deferred, command, service_name) {

    _deferred = deferred;

    _waitForSockFile(function() {

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
                case 'runpreset':
                    _runPreset(service_name);
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
                case 'stateall':
                    _stateAllServices();
                    break;
                case 'dashboard':
                    _openDashboard();
                    break;
                case 'halt':
                    _haltSwamp();
                    break;
            }

        }, command);

    }, function() {

        _deferred.reject('* unix socket file ' + CLI_UNIX_SOCKET_FILE + ' not exist!');

    });

}

function _initializeSocketConnection(onConnect, command) {

    conn = net.createConnection(CLI_UNIX_SOCKET_FILE);

    conn.on('connect', onConnect);

    conn.on('data', _onSocketData);

    conn.on('error', _onSocketError.bind(null, command));
}

function _broadcast(data) {

    if(conn && data) {

        conn.write(JSON.stringify(data));

    }
}

function _onSocketError(command, err) {

    console.log(('* error executing `' + command + '`: ' + err.toString())['red']);

    console.log('* zombie process may still be alive'['red']);

    _deferred.reject(err);

}

function _onSocketData(data) {

    if(data.toString().indexOf(END_DELIMITER) > -1) {

        buffer += data.toString().replace(END_DELIMITER, '');

        try {

            var json = JSON.parse(buffer.toString());

            _processData(json);

            if(json.event == event) {
                conn.end();
            }

        } catch(e) { }

        buffer = '';

    } else {
        buffer += data.toString();
    }

}

function _processData(data) {

    if(data.data.msg) {

        if(data.data.type == 'none') {

            console.log('* ' + data.data.msg);

        } else {

            console.log(('* ' + data.data.msg)[data.data.type == 'error' ? 'red' : 'green']);

        }

    }

    _deferred && _deferred.resolve(data);

    if(data.event == event) {
        conn.end();
    }
}

function _startService(service_name) {

    event = 'service.start';

    _broadcast({ event: event, data: service_name });

}

function _restartService(service_name) {

    event = 'service.restart';

    _broadcast({ event: event, data: service_name });

}

function _serviceState(service_name) {

    event = 'service.state';

    _broadcast({ event: event, data: service_name });

}

function _runPreset(preset_name) {

    event = 'preset.run';

    _broadcast({ event: event, data: preset_name });

}

function _stopService(service_name) {

    event = 'service.stop';

    _broadcast({ event: event, data: service_name });

}

function _startAllServices() {

    event = 'swamp.startAll';

    _broadcast({ event: event });

}

function _stopAllServices() {

    event = 'swamp.stopAllRunning';

    _broadcast({ event: event });

}

function _restartAllServices() {

    event = 'swamp.restartAllRunning';

    _broadcast({ event: event });

}

function _stateAllServices() {

    event = 'swamp.stateAll';

    _broadcast({ event: event });

}

function _openDashboard() {

    event = 'swamp.dashboard';

    _broadcast({ event: event });

}

function _haltSwamp() {

    event = 'swamp.halt';

    _broadcast({ event: event });

}
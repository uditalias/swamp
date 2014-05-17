"use strict";

var CLI_UNIX_SOCKET_FILE    = "swamp_cli.sock",
    END_DELIMITER           = "[=!=SWAMP_DATA_END=!=]",
    colors                  = require('colors'),
    readline                = require('readline'),
    os                      = require('os'),
    rl                      = readline.createInterface(process.stdin, process.stdout),
    prompt                  = 'swamp> ',
    net                     = require('net');

var conn = net.createConnection(CLI_UNIX_SOCKET_FILE);

console.log('connecting to swamp shell...');

function broadcast(data) {

    conn.write(JSON.stringify(data));

}

function listServices(services) {

    process.stdout.write(os.EOL);

    console.log('service name\t\t\t\trunning'['yellow']);

    console.log((line() + line())['yellow']);

    for(var i = 0, len = services.length; i < len; i++) {

        var srv = services[i];
        process.stdout.write(srv.name['green']);
        process.stdout.write('\t\t\t');
        process.stdout.write(srv.isRunning.toString());
        process.stdout.write(os.EOL);

    }
}

function printResponse(res) {
    console.log(os.EOL + res.msg[res.type == 'error' ? 'red' : 'green']);
}

function processData(obj) {

    obj = obj || {};

    if(!obj.event) { return; }

    switch(obj.event) {
        case 'swamp.listServices':
            listServices(obj.data);
            break;
        case 'service.start':
        case 'service.stop':
        case 'service.restart':
        case 'swamp.stopAllRunning':
        case 'swamp.startAll':
        case 'swamp.restartAllRunning':
            printResponse(obj.data);
            break;
    }

    rl.resume();
    rl.prompt(true);

}

function initializeCliPrompt() {
    rl.on('line', function(line) {

        line = line ? line.trim() : '';

        if(!line) {
            rl.prompt(true);
            return;
        }

        var firstSpaceIndex = line.indexOf(' ');
        firstSpaceIndex = firstSpaceIndex > 0 ? firstSpaceIndex : line.length;
        var params = line.substr(firstSpaceIndex + 1, line.length);
        line = line.substr(0, firstSpaceIndex);

        rl.pause();

        switch(line) {
            case 'list':
                broadcast({ event: 'swamp.listServices' });
                break;
            case 'start':
                console.log(os.EOL + ('starting service `' + params + '`...')['cyan']);
                broadcast({ event: 'service.start', data: params });
                break;
            case 'stop':
                console.log(os.EOL + ('stopping service `' + params + '`...')['cyan']);
                broadcast({ event: 'service.stop', data: params });
                break;
            case 'restart':
                console.log(os.EOL + ('restarting service `' + params + '`...')['cyan']);
                broadcast({ event: 'service.restart', data: params });
                break;
            case 'stopall':
                console.log(os.EOL + ('stopping all running services...')['cyan']);
                broadcast({ event: 'swamp.stopAllRunning' });
                break;
            case 'startall':
                console.log(os.EOL + ('starting all services...')['cyan']);
                broadcast({ event: 'swamp.startAll' });
                break;
            case 'restartall':
                console.log(os.EOL + ('restarting all running services...')['cyan']);
                broadcast({ event: 'swamp.restartAllRunning' });
                break;
            case 'exit':
                deactivate();
                break;
            default:
                console.log(('command `' + line + '` not valid')['red']);
                rl.resume();
                rl.prompt(true);

        }

    }).on('close', function() {
        deactivate();
    });

    rl.setPrompt(prompt, prompt.length);
    rl.prompt(true);
}

function deactivate() {

    console.log(os.EOL + 'Bye bye...');

    process.exit(0);

}

function line() {
    return '---------------------------------';
}

conn.on('connect', function() {

    console.log('Swamp shell connected!');
    console.log(line());

    initializeCliPrompt();

});

var chunk = '';

conn.on('data', function(data) {

    if(data.toString().indexOf(END_DELIMITER) > -1) {

        chunk += data.toString().replace(END_DELIMITER, '');

        try {

            var json = JSON.parse(chunk.toString());

            processData(json);

        } catch(e) { }

        chunk = '';

    } else {
        chunk += data.toString();
    }

});

conn.on('end', deactivate);

process.on('SIGINT', deactivate);

process.on('SIGTERM', deactivate);
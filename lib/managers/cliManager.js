"use strict";

var appolo = require('appolo-express'),
    EOL = require('os').EOL,
    EventDispatcher = appolo.EventDispatcher,
    net = require('net'),
    SERVICE_PHASE = require('../utils/enums').SERVICE_PHASE,
    Q = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'cliManager',
        singleton: true,
        initMethod: 'initialize',
        properties: [{
            name: '_createCliClient',
            factoryMethod: 'cliClient'
        }],
        inject: ['utils', 'env', 'swampServicesManager', 'dashboardManager', 'swampManager', 'presetsManager']
    },

    _CLI_UNIX_SOCKET_FILE: 'swamp_cli.sock',

    initialize: function () {

        this._clients = {};

        this._server = null;

    },

    launch: function () {

        this._removeSocketFile();

        this._server = net.createServer(this._onCliClientConnection.bind(this));

        this._server.listen(this._CLI_UNIX_SOCKET_FILE);

        this._bindEvents();
    },

    broadcast: function (message) {

        _.forEach(this._clients, function (client) {
            client.sendMessage(message);
        });

    },

    dispose: function () {

        this._removeSocketFile();

    },

    _disconnectAllClients: function () {

        _.forEach(this._clients, function (client) {
            client.disconnect();
        });
    },


    _removeSocketFile: function () {

        if (this.utils.fileExist(this._CLI_UNIX_SOCKET_FILE)) {

            this.utils.removeFile(this._CLI_UNIX_SOCKET_FILE);

        }

    },

    _onCliClientConnection: function (socket) {

        var cliClient = this._createCliClient(socket);

        cliClient.on('swamp.listServices', this._onCliClientListServices, this);

        cliClient.on('swamp.restartAllRunning', this._onCliClientRestartAllRunning, this);

        cliClient.on('swamp.stopAllRunning', this._onCliClientStopAllRunning, this);

        cliClient.on('swamp.startAll', this._onCliClientStartAll, this);

        cliClient.on('swamp.stateAll', this._onCliClientStateAll, this);

        cliClient.on('swamp.autoRun', this._onCliClientAutoRun, this);

        cliClient.on('service.start', this._onCliClientServiceStart, this);

        cliClient.on('service.stop', this._onCliClientServiceStop, this);

        cliClient.on('service.restart', this._onCliClientServiceRestart, this);

        cliClient.on('service.state', this._onCliClientServiceState, this);

        cliClient.on('preset.run', this._onCliClientRunPreset, this);

        cliClient.on('disconnect', this._onCliClientDisconnected, this);

        cliClient.on('swamp.dashboard', this._onCliClientDashboard, this);

        cliClient.on('swamp.halt', this._onCliClientHalt, this);

        var cid = cliClient.getSocketId();

        this._clients[cid] = cliClient;

    },

    _onCliClientListServices: function (data, client) {
        var msg = '***************' + EOL;
        var type = 'none';

        var servicesNames = _.pluck(this.swampServicesManager.getAll(), 'name');
        msg = _.reduce(servicesNames, function(msg, serviceName){
           return msg + serviceName + EOL
        },msg);


        client.sendMessage({event: 'swamp.listServices', data: {msg:msg, type:type}});

    },

    _onCliClientRestartAllRunning: function (data, client) {

        var msg = 'all running swamp services has restarted.';
        var type = 'success';

        client.sendMessage({event: 'log', data: {msg: 'restarting all services...', type: 'none'}});

        this.swampServicesManager.restartAllRunning()
            .finally(function () {

                client.sendMessage({event: 'swamp.restartAllRunning', data: {msg: msg, type: type}});

            });

    },

    _onCliClientStopAllRunning: function (data, client) {

        var msg = 'all running swamp services has stopped.';
        var type = 'success';

        client.sendMessage({event: 'log', data: {msg: 'stopping all services...', type: 'none'}});

        this.swampServicesManager.stopAllRunning().then(function () {

            client.sendMessage({event: 'swamp.stopAllRunning', data: {msg: msg, type: type}});

        });
    },

    _onCliClientStartAll: function (data, client) {

        var msg = 'all swamp services has started.';
        var type = 'success';

        client.sendMessage({event: 'log', data: {msg: 'starting all services...', type: 'none'}});

        this.swampServicesManager.startAll()
            .then(function () {

                client.sendMessage({event: 'swamp.startAll', data: {msg: msg, type: type}});

            });
    },

    _onCliClientStateAll: function (data, client) {

        var msg = ('swamp services state:' + EOL);
        var type = 'none';
        var status;

        var services = this.swampServicesManager.getAll();

        _.forEach(services, function (service) {

            switch (service.getPhase()) {
                case SERVICE_PHASE.NONE:
                    status = 'none'['cyan'];
                    break;
                case SERVICE_PHASE.STARTING:
                    status = 'starting...'['green'];
                    break;
                case SERVICE_PHASE.STARTED:
                    status = 'started'['green'];
                    break;
                case SERVICE_PHASE.STOPPING:
                    status = 'stopping...'['red'];
                    break;
                case SERVICE_PHASE.STOPPED:
                    status = 'stopped'['red'];
                    break;
                case SERVICE_PHASE.PENDING:
                    status = 'pending...'['cyan'];
                    break;
            }

            msg += ('service `{0}` state: {1}' + EOL).format(service.name, status);

        });

        client.sendMessage({event: 'swamp.stateAll', data: {msg: msg, type: type}});

    },

    _onCliClientAutoRun: function (data, client) {
        // do nothing... wait for the swampManager for response...
        if (this.swampServicesManager.isAutoRunFinished()) {
            this.broadcast({
                event: 'swamp.autoRun',
                data: {success: true}
            });
        }
    },

    _onCliClientServiceStart: function (data, client) {

        var msg = '';
        var type = 'success';

        var service = this.swampServicesManager.getByName(data.data);

        if (!service) {
            type = 'error';
            msg = 'service `{0}` doesn\'t exist.'.format(data.data);
        } else {

            service.start();

            msg = 'service `{0}` started.'.format(data.data);

        }

        client.sendMessage({event: 'service.start', data: {msg: msg, type: type}});

    },

    _onCliClientServiceStop: function (data, client) {

        var msg = '';
        var type = 'success';

        var service = this.swampServicesManager.getByName(data.data);

        if (!service) {
            type = 'error';
            msg = 'service `{0}` doesn\'t exist.'.format(data.data);
        } else {

            service.stop();

            msg = 'service `{0}` stopped.'.format(data.data);

        }

        client.sendMessage({event: 'service.stop', data: {msg: msg, type: type}});

    },

    _onCliClientServiceRestart: function (data, client) {

        var msg = '';
        var type = 'success';

        var service = this.swampServicesManager.getByName(data.data);

        if (!service) {
            type = 'error';
            msg = 'service `{0}` doesn\'t exist.'.format(data.data);
        } else {

            service.restart();

            msg = 'service `{0}` restarted.'.format(data.data);

        }

        client.sendMessage({event: 'service.restart', data: {msg: msg, type: type}});

    },

    _onCliClientServiceState: function (data, client) {

        var msg = '';
        var type = 'success';

        var service = this.swampServicesManager.getByName(data.data);

        if (!service) {
            type = 'error';
            msg = 'service `{0}` doesn\'t exist.'.format(data.data);
        } else {

            var status = service.isRunning ? 'running' : 'not running';

            msg = 'service `{0}` state: {1}'.format(data.data, status);

        }

        client.sendMessage({event: 'service.state', data: {msg: msg, type: type}});

    },

    _onCliClientRunPreset: function (data, client) {

        var msg = '';
        var type = 'success';

        var preset = this.presetsManager.getPresetByName(data.data[0]);

        if (!preset) {
            type = 'error';
            msg = 'preset `{0}` doesn\'t exist.'.format(data.data);

            client.sendMessage({event: 'preset.run', data: {msg: msg, type: type}});

        } else {

            client.sendMessage({event: 'log', data: {msg: 'running preset `{0}`...'.format(data.data), type: 'none'}});

            this.presetsManager.runPreset(preset.id)

                .then(function () {

                    msg = 'preset `{0}` applied'.format(data.data);

                    client.sendMessage({event: 'preset.run', data: {msg: msg, type: type}});

                });
        }

    },

    _onCliClientDashboard: function (data, client) {

        var msg = 'running swamp dashboard...';
        var type = 'success';

        this.dashboardManager.open();

        client.sendMessage({event: 'swamp.dashboard', data: {msg: msg, type: type}});

    },

    _onCliClientHalt: function (data, client) {

        var msg = null;
        var type = 'success';

        this.swampManager.dispose(null, false).then(function () {

            client.sendMessage({event: 'swamp.halt', data: {msg: msg, type: 'type'}});

            process.exit(0);

        });

    },

    _onCliClientDisconnected: function (cliClient) {

        cliClient.un('swamp.listServices', this._onCliClientListServices, this);
        cliClient.un('swamp.restartAllRunning', this._onCliClientRestartAllRunning, this);
        cliClient.un('swamp.stopAllRunning', this._onCliClientStopAllRunning, this);
        cliClient.un('swamp.startAll', this._onCliClientStartAll, this);
        cliClient.un('swamp.stateAll', this._onCliClientStateAll, this);
        cliClient.un('swamp.autoRun', this._onCliClientAutoRun, this);
        cliClient.un('service.start', this._onCliClientServiceStart, this);
        cliClient.un('service.stop', this._onCliClientServiceStop, this);
        cliClient.un('service.restart', this._onCliClientServiceRestart, this);
        cliClient.un('service.state', this._onCliClientServiceState, this);
        cliClient.un('preset.run', this._onCliClientRunPreset, this);
        cliClient.un('disconnect', this._onCliClientDisconnected, this);
        cliClient.un('swamp.dashboard', this._onCliClientDashboard, this);
        cliClient.un('swamp.halt', this._onCliClientHalt, this);

        var cid = cliClient.getSocketId();

        this._clients[cid] = null;
        delete this._clients[cid];

    },

    _onServerError: function (err) {

    },

    _onServerListenStart: function () {

    },

    _bindEvents: function () {

        this._server.on('error', this._onServerError.bind(this));

        this._server.on('listening', this._onServerListenStart.bind(this));

    }
});
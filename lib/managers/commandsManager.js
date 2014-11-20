"use strict";
var appolo              = require('appolo-express'),
    EventDispatcher     = appolo.EventDispatcher,
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'commandsManager',
        singleton: true,
        properties: [
            {
                name: '_createCommand',
                factoryMethod: 'command'
            }
        ],
        inject: ['env']
    },

    constructor: function () {
        this._commandsDefinition = {};
        this._commands = {};
    },

    initialize: function (commands) {

        _.forEach(commands || [], this._onEachCommand.bind(this));

    },

    serialize: function () {

        var commands = [];

        _.forEach(this._commands, function(command) {
            commands.push(command.serialize());
        });

        return {
            definitions: _.toArray(this._commandsDefinition),
            executions: commands
        };
    },

    executeServiceCommand: function(service, commandId) {

        var command = this.getCommandById(commandId);

        if(command) {

            var exeCommand = this._createCommand(command, service);

            if(exeCommand) {
                this._commands[exeCommand.id] = exeCommand;

                this._commands[exeCommand.id].on('started', this._onCommandStarted, this);

                this._commands[exeCommand.id].on('stdout', this._onCommandLog, this);

                this._commands[exeCommand.id].on('disposed', this._onCommandDisposed, this);

                this._commands[exeCommand.id].run();
            }
        }
    },

    terminateCommand: function(exeId) {

        if(this._commands[exeId]) {
            this._commands[exeId].terminate();
        }

    },

    getCommandById: function(id) {
        return this._commandsDefinition[id];
    },

    _onEachCommand: function (command) {
        if(command.cmd) {
            var id = _.guid();
            this._commandsDefinition[id] = {
                id: id,
                name: command.name,
                cmd: command.cmd
            };
        }
    },

    _onCommandStarted: function(exeCommandId, commandId, serviceName) {

        if(this._commands[exeCommandId]) {

            var serialized = this._commands[exeCommandId].serialize();

            this.fireEvent('started', exeCommandId, commandId, serviceName, serialized);
        }
    },

    _onCommandLog: function(exeCommandId, commandId, serviceName, logData) {
        this.fireEvent('stdout', exeCommandId, commandId, serviceName, logData);
    },

    _onCommandDisposed: function(exeCommandId, commandId, serviceName, success) {
        this.fireEvent('disposed', exeCommandId, commandId, serviceName, success);

        this._commands[exeCommandId].un('stdout', this._onCommandLog, this);
        this._commands[exeCommandId].un('disposed', this._onCommandDisposed, this);

        this._commands[exeCommandId] = null;
        delete this._commands[exeCommandId];
    }
});
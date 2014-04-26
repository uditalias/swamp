"use strict";
var colors          = require('colors'),
    Q               = require('q'),
    os              = require('os'),
    fs              = require('fs'),
    path            = require('path'),
    util            = require('util'),
    Class           = require('appolo').Class,
    moment          = require('moment'),
    spawn           = require('child_process').spawn;

module.exports = Class.define({

    $config: {
        id: 'utils',
        singleton: true,
        inject: ['optionsManager']
    },

    LOG_TYPE: {
        ERROR: 'red',
        WARN: 'yellow',
        SUCCESS: 'green',
        INFO: 'cyan'
    },

    log: function(text, type, oneLine, force, logger) {

        var self = this;

        type = type || this.LOG_TYPE.INFO;

        if(logger) {

            if(logger instanceof Array) {

                _.forEach(logger, function(_logger) {

                    _logger.log(type == self.LOG_TYPE.ERROR ? 'error' : 'info', text);

                });

            } else {

                logger.log(type == this.LOG_TYPE.ERROR ? 'error' : 'info', text);

            }
        }

        if(this.optionsManager.getOptions().silence && !force) {
            return;
        }

        text += oneLine ? '' : os.EOL;

        process.stdout.write(text[type])

    },

    prompt: function(text, type, defaultAnswer) {
        var deferred = Q.defer();

        text += defaultAnswer ? ' (Y/n): ' : ' (y/N): ';

        this.log(text, type, true);

        process.stdin.on('data', function(data) {

            process.stdin.end();

            if(data == os.EOL) {
                defaultAnswer ? deferred.resolve(true) : deferred.reject();
            } else {
                data.toLowerCase() == 'y' + os.EOL ?  deferred.resolve(true) : deferred.reject();
            }

        });

        process.stdin.setEncoding('utf8');
        process.stdin.read();

        return deferred.promise;
    },

    inherits: util.inherits,

    guid: function() {
        return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
    },

    openUrl: function(url) {
        var cmd;
        switch(process.platform) {
            case 'darwin':
                cmd = 'open';
                break;
            case 'win32':
                cmd = 'explorer.exe';
                break;
            case 'linux':
                cmd = 'xdg-open';
                break;
        }

        cmd && spawn(cmd, [url]);
    },

    mkdir: function(dirname) {

        var pathSep = path.sep;

        var dirs = dirname.split(pathSep);
        var root = "";

        while (dirs.length > 0) {
            var dir = dirs.shift();
            if (dir === "") {// If directory starts with a /, the first path will be an empty string.
                root = pathSep;
            }
            if (!fs.existsSync(root + dir)) {
                fs.mkdirSync(root + dir);
            }
            root += dir + pathSep;
        }

    },

    mkfile: function(filepath, flag) {

        var full_path = path.resolve(process.cwd(), filepath);

        this.writeFile(full_path, '', flag);

    },

    getTotalMemory: function() {

        return os.totalmem();

    },

    writeFile: function(path, data, flag) {
        var _options = {};

        if(flag) {
            _options.flag = flag;
        }

        fs.writeFileSync(path, data, _options);
    },

    fileExist: function(path) {
        return fs.existsSync(path);
    },

    isEmptyDir: function(path) {
        return fs.readdirSync(path).length == 0;
    },

    timeFrom: function(date) {
        var current = moment(new Date());

        return current.from(date);
    }
});
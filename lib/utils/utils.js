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

    log: function(text, type, oneLine, force) {

        if(this.optionsManager.getOptions().silence && !force) {
            return;
        }

        type = type || this.LOG_TYPE.INFO;
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
        if(!fs.existsSync(dirname))
            fs.mkdirSync(path.resolve(process.cwd(), dirname));
    },

    mkfile: function(filepath, flag) {
        fs.openSync(path.resolve(process.cwd(), filepath), flag);
    },

    fileExist: function(path) {
        return fs.existsSync(path);
    },

    timeFrom: function(date) {
        var current = moment(new Date());

        return current.from(date);
    }
});
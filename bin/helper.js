"use strict";

var colors          = require('colors'),
    Q               = require('q'),
    os              = require('os');

var helper = {

    LOG_TYPE: {
        ERROR: 'red',
        WARN: 'yellow',
        SUCCESS: 'green',
        INFO: 'cyan'
    },

    log: function(text, type, oneLine) {
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
    }
};


module.exports = helper;
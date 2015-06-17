"use strict";

var Class   = require('appolo-express').Class,
    path    = require('path');

module.exports = Class.define({

    $config: {
        id: 'logOptionsParser',
        singleton: true,
        inject: ['env', 'utils']
    },

    createDefaultLogsFolder: function(logs, folderName) {

        var _createDefault = true;

        if(logs) {

            if(typeof logs.err !== 'string' && typeof logs.out !== 'string') {

                if((logs.err && logs.err.path) && (logs.out && logs.out.path)) {

                    _createDefault = false;

                }
            } else if(logs.err && logs.out) {

                _createDefault = false;

            }

        }

        if(_createDefault) {

            this.utils.mkdir(folderName);

        }

    },

    getLogPath: function(logs, type, defaultFolderName) {

        var _defaultPath = true;
        var _path;

        if(logs) {

            if(logs[type]) {

                if(typeof logs[type] === 'string') {

                    _path = logs[type];
                    _defaultPath = false;

                } else if(typeof logs[type].path === 'string') {

                    _path = logs[type].path;
                    _defaultPath = false;

                }

            }

        }

        if(_defaultPath) {

            _path = path.resolve(process.cwd(), '{0}/{1}.log'.format(defaultFolderName, type));

        }

        return _path;

    },

    getLogFilesSize: function(logs, defaultSize) {

        var _outLogSize = defaultSize || '1MB';
        var _errLogSize = defaultSize || '1MB';

        if(logs) {

            if(logs.out && logs.out.maxSize) {

                try {

                    _.unhumanizeSize(logs.out.maxSize);
                    _outLogSize = logs.out.maxSize;

                } catch(e) {

                    _outLogSize = '1MB';

                }

            }

            if(logs.err && logs.err.maxSize) {

                try {

                    _.unhumanizeSize(logs.err.maxSize);
                    _errLogSize = logs.err.maxSize

                } catch(e) {

                    _errLogSize = '1MB';

                }
            }

        }

        return {
            out: _.unhumanizeSize(_outLogSize),
            err: _.unhumanizeSize(_errLogSize)
        }
    },

    getLogFilesMax: function(logs) {
        var outLogMaxFiles = 100;
        var errLogMaxFiles = 100;

        if(logs) {
            if(logs.out && logs.out.maxFiles && !isNaN(logs.out.maxFiles)) {
                outLogMaxFiles = logs.err.maxFiles;
            }

            if(logs.err && logs.err.maxFiles && !isNaN(logs.err.maxFiles)) {
                errLogMaxFiles = logs.err.maxFiles;
            }
        }

        return {
            out: outLogMaxFiles,
            err: errLogMaxFiles
        }
    }
});
var _               = require('lodash'),
    fs              = require('fs'),
    path            = require('path'),
    child_process   = require('child_process'),
    exec            = child_process.exec,
    utils           = require('./helper');

var SWAMP_FILE_NAME     = 'Swampfile.js',
    basedir             = process.cwd();

module.exports.create = function() {

    // looking for SWAMP_FILE_NAME
    var swampConfPath = path.resolve(SWAMP_FILE_NAME);

    var _confirm = function(override) {

        var swampfileBootstrap, filePath;

        if(override) {
            utils.log('Overriding `' + SWAMP_FILE_NAME + '`...', utils.LOG_TYPE.WARN);
        } else {
            utils.log('Creating bootstrap `' + SWAMP_FILE_NAME + '`...', utils.LOG_TYPE.INFO);
        }

        try {
            swampfileBootstrap = fs.readFileSync(path.resolve(__dirname, '../config/assets/{0}'.format(SWAMP_FILE_NAME)), 'utf8');
        } catch(e) {
            utils.log(e, utils.LOG_TYPE.ERROR);
        }

        filePath = path.resolve(basedir, SWAMP_FILE_NAME);

        fs.writeFileSync(filePath, swampfileBootstrap);

        utils.log('`{0}` created successfully at `{1}`.'.format(SWAMP_FILE_NAME, filePath), utils.LOG_TYPE.SUCCESS);
    }

    var _decline = function() {
        utils.log('Bye Bye...', utils.LOG_TYPE.SUCCESS);
    }

    if(swampConfPath && utils.fileExist(swampConfPath)) {

        utils.prompt(SWAMP_FILE_NAME + ' already exist in `' + basedir + '`, override?', utils.LOG_TYPE.WARN, false)
            .then(_confirm)
            .catch(_decline);
    } else if(swampConfPath && !utils.isEmptyDir(basedir)) {

        utils.prompt(basedir + ' is not empty, continue anyway?', utils.LOG_TYPE.WARN, false)
            .then(_confirm)
            .catch(_decline);

    } else {
        _confirm();
    }
}

module.exports.run = function() {
    require('./runner');
}

module.exports.daemon = function() {

    var swampConfPath = path.resolve(SWAMP_FILE_NAME);

    var daemon_command = "nohup swamp -r > /dev/null 2>&1 &";

    utils.log('* running swamp...', utils.LOG_TYPE.INFO);

    if (swampConfPath && !fs.existsSync(swampConfPath)) {

        utils.log('* can\'t find `Swampfile.js` in ' + (basedir), utils.LOG_TYPE.ERROR);

        return;
    }

    exec(daemon_command, function(err) {
        if(!err) {
            utils.log('* done.', utils.LOG_TYPE.SUCCESS);
        }
    });

}

module.exports.kill = function() {

    var get_process_pid = "(ps aux | grep '[s]wamp' | grep -v grep | awk '{print $2}')";

    exec(get_process_pid, function(error, stdout, stderr) {
        var pids = stdout.split('\n');

        pids = _.without(pids, '');

        if(pids.length && pids.length > 1) {

            utils.log('* killing swamp...', utils.LOG_TYPE.INFO);

            process.kill(pids[0]);

            utils.log('* done.', utils.LOG_TYPE.SUCCESS);
        } else {

            utils.log('* swamp is not running', utils.LOG_TYPE.WARN);

        }
    });
}

module.exports.status = function() {

}
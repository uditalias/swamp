var _               = require('lodash'),
    fs              = require('fs'),
    path            = require('path'),
    npid            = require('npid'),
    utils           = require('./helper'),
    child_process   = require('child_process'),
    exec            = child_process.exec;

var SWAMP_FILE_NAME     = 'Swampfile.js',
    basedir             = process.cwd(),
    PID_FILE            = basedir + '/swamp.pid';


function _confirmCreatePrompt(override) {
    var swampfileBootstrap, filePath;

    if(override) {

        utils.log('Overriding `' + SWAMP_FILE_NAME + '`...', utils.LOG_TYPE.WARN);

    } else {

        utils.log('Creating bootstrap `' + SWAMP_FILE_NAME + '`...', utils.LOG_TYPE.INFO);

    }

    try {

        swampfileBootstrap = fs.readFileSync(path.resolve(__dirname, '../config/assets/' + SWAMP_FILE_NAME), 'utf8');

    } catch(e) {

        utils.log(e, utils.LOG_TYPE.ERROR);

    }

    filePath = path.resolve(basedir, SWAMP_FILE_NAME);

    fs.writeFileSync(filePath, swampfileBootstrap);

    utils.log('`' + SWAMP_FILE_NAME + '` created successfully at `' + filePath + '`.', utils.LOG_TYPE.SUCCESS);
}

function _declineCreatePrompt() {

    utils.log('Bye Bye...', utils.LOG_TYPE.SUCCESS);
}

module.exports.create = function() {

    // looking for SWAMP_FILE_NAME
    var swampConfPath = path.resolve(SWAMP_FILE_NAME);

    if(swampConfPath && utils.fileExist(swampConfPath)) {

        utils.prompt(SWAMP_FILE_NAME + ' already exist in `' + basedir + '`, override?', utils.LOG_TYPE.WARN, false)
            .then(_confirmCreatePrompt)
            .catch(_declineCreatePrompt);
    } else if(swampConfPath && !utils.isEmptyDir(basedir)) {

        utils.prompt(basedir + ' is not empty, continue anyway?', utils.LOG_TYPE.WARN, false)
            .then(_confirmCreatePrompt)
            .catch(_declineCreatePrompt);

    } else {
        _confirmCreatePrompt();
    }
}

module.exports.run = function() {

    if(!require('./pid')(PID_FILE, true)) {
        return;
    }

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

    var swampConfPath = path.resolve(SWAMP_FILE_NAME);

    utils.log('* killing swamp...', utils.LOG_TYPE.INFO);

    if (swampConfPath && !fs.existsSync(swampConfPath)) {

        utils.log('* can\'t find `Swampfile.js` in ' + (basedir), utils.LOG_TYPE.ERROR);

        return;
    }

    if(!utils.fileExist(PID_FILE)) {

        utils.log('* swamp is not running', utils.LOG_TYPE.WARN);

        return;
    }

    var pid = utils.readFile(PID_FILE);

    pid = parseInt(pid);

    process.kill(pid, 'SIGTERM');

    if(npid.remove(PID_FILE)) {

        utils.log('* done.', utils.LOG_TYPE.SUCCESS);

    } else {

        utils.log('* swamp is not running', utils.LOG_TYPE.WARN);

    }
}

module.exports.status = function() {
    if(utils.fileExist(PID_FILE)) {

        var pid = utils.readFile(PID_FILE);

        pid = parseInt(pid);

        utils.log('* swamp is running [' + pid + ']', utils.LOG_TYPE.INFO);
    } else {
        utils.log('* swamp is not running', utils.LOG_TYPE.WARN);
    }
}
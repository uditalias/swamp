// creating the swamp PID file

var npid        = require('npid'),
    utils       = require('./helper');

function exit(code, err) {

    if(err) {
        utils.log(err, utils.LOG_TYPE.ERROR);
    }

    process.exit(code || 0);
}

module.exports = function(path, removeOnExit) {

    try {
        var pid = npid.create(path);

        if(removeOnExit) {
            pid.removeOnExit();
        }

        return true;

    } catch(err) {

        utils.log('* can\'t create pid file, try running the swamp with root permissions', utils.LOG_TYPE.ERROR);
        exit(1, err);

        return false;
    }

}

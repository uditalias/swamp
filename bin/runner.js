'use strict';

var swampRunner   = require('../swamp'),
    appolo        = swampRunner.appolo;

var SWAMP_FILE_NAME     = 'Swampfile.js';

var path        = require('path'),
    utils       = appolo.inject.getObject('utils'),
    version     = require('../package.json').version;

process.title = 'swamp ' + version;

var swampConfRunner;

// looking for SWAMP_FILE_NAME
var swampConfPath = path.resolve(SWAMP_FILE_NAME);

if (swampConfPath && utils.fileExist(swampConfPath)) {

    utils.log(SWAMP_FILE_NAME + ' file found (' + swampConfPath + ')!', utils.LOG_TYPE.SUCCESS);

} else {

    utils.log(SWAMP_FILE_NAME + ' not exist. did you mean `swamp create`?', utils.LOG_TYPE.ERROR);

    return;
}

// try load configurations file from path
utils.log('Validating Swamp configurations...', utils.LOG_TYPE.INFO);

try {

    swampConfRunner = require(swampConfPath);

} catch(err) {

    utils.log('Invalid `{0}`: {1}'.format(SWAMP_FILE_NAME, err), utils.LOG_TYPE.ERROR);
    return;

}

// creating a Swamp
utils.log('Swamp configurations are valid, creating a Swamp...', utils.LOG_TYPE.SUCCESS);
var swamp = appolo.inject.getObject('initializer');

// running Swamp configurations
swampConfRunner(swamp);
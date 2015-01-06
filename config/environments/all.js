"use strict";
module.exports = {

    name: 'all',
    version: require('../../package.json').version,

    serviceUsagePollInterval: 2500,

    signalEvents: ['SIGTERM', 'SIGPIPE', 'SIGHUP', 'SIGINT', 'SIGBREAK', 'SIGKILL', 'SIGSTOP'],

    databaseCollections: [ 'configurations', 'sessions', 'presets' ]
};
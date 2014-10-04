"use strict";
module.exports = {

    name: 'all',
    version: require('../../package.json').version,

    watcherTurtle: 1000,

    serviceUsagePollInterval: 2500,

    signalEvents: ['SIGTERM', 'SIGPIPE', 'SIGHUP', 'SIGINT', 'SIGBREAK', 'SIGKILL', 'SIGSTOP']
};
"use strict";
module.exports = [{
    path: '/io/:serviceId/:type/',
    method: 'get',
    controller: 'ioStream',
    action: 'get'
}, {
    path: '/io/:serviceId/:type/stream/',
    method: 'get',
    controller: 'ioStream',
    action: 'getStream'
}, {
    path: '/io/:serviceId/:type/list/',
    method: 'get',
    controller: 'ioStream',
    action: 'getLogFilesList'
}];
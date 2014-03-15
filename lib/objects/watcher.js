'use strict';
var Class           = require('appolo').Class,
    path            = require('path'),
    gaze            = require('gaze');

module.exports = Class.define({

    $config: {
        id: 'watcher',
        singleton: false,
        inject: ['env']
    },

    constructor: function(path, callback) {
        this._FSwatcher = null;
        this._timer = null;
        this._changes = [];
        this.callback = callback;
        this.path = path;
    },

    start: function() {
        if(!this._FSwatcher) {
            this._FSwatcher = gaze(path.resolve(this.path) + '/**/*', this._onGazeWatcherStart.bind(this));
        }
    },

    stop: function() {
        if(this._FSwatcher) {
            this._FSwatcher.close();
            this._FSwatcher = null;
        }
    },

    _onGazeWatcherStart: function() {
        this._FSwatcher.on('all', this._onWatcherEvent.bind(this));
    },

    _onWatcherEvent: function(event, file) {

        if(!this._timer) {
            this._changes.push({ event: event, path: file });
            this._timer = setTimeout(this._fireChangeEvent.bind(this, event, file), this.env.watcherTurtle);
        } else {
            clearTimeout(this._timer);
            this._timer = null;
            this._onWatcherEvent(event, file);
        }

    },

    _fireChangeEvent: function(event, file) {
        this._timer = null;
        this.callback && this.callback(this._changes);
        this._changes = [];
    }
});
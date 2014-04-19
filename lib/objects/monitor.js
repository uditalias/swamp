'use strict';
var EventDispatcher     = require('appolo').EventDispatcher,
    usage               = require('usage');

module.exports = EventDispatcher.define({

    $config: {
        id: 'monitor',
        singleton: false,
        inject: ['env']
    },

    constructor: function() {

        this._pid = null;
        this._timer = null;
        this._options = { keepHistory: true };

    },

    start: function(processId) {

        if(!this._timer) {

            this._pid = processId;

            this._sendProcessUsage();

        }

    },

    stop: function() {

        if(this._timer) {
            clearTimeout(this._timer);
            usage.clearHistory && usage.clearHistory(this._pid);
            this._timer = null;
            this._pid = null;
        }
    },

    _sendProcessUsage: function() {

        usage.lookup(this._pid, this._options, function(err, result) {

            if(!err) {
                this.fireEvent('data', result);
            }

            this._timer = setTimeout(this._sendProcessUsage.bind(this), this.env.serviceUsagePollInterval);

        }.bind(this));

    }
});
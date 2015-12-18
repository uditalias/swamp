'use strict';
var EventDispatcher     = require('appolo-express').EventDispatcher,
    usage               = require('usage');

module.exports = EventDispatcher.define({

    $config: {
        id: 'monitor',
        singleton: false,
        inject: ['env']
    },

    constructor: function(monitorMemory, monitorCpu, monitorTime) {

        this._pid = null;
        this._timer = null;
        this._options = { keepHistory: true };
        this._monitorMemory = monitorMemory;
        this._monitorCpu = monitorCpu;
        this._monitorDuration = monitorTime;
        this._lastMonitorData = {};

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

        try {

            usage.lookup(this._pid, this._options, function(err, result) {

                if(!err) {

                    if(!this._monitorMemory) {
                        delete result['memory'];
                    }

                    if(!this._monitorCpu) {
                        delete result['cpu'];
                    }

                    if(!this._monitorDuration){
                        delete result['duration']
                    }

                    if(result['cpu'] != this._lastMonitorData['cpu']
                        || result['memory'] != this._lastMonitorData['memory']) {

                        this.fireEvent('data', null, result);

                        this._lastMonitorData = result;
                    }
                }

                this._timer = setTimeout(this._sendProcessUsage.bind(this), this.env.serviceUsagePollInterval);

            }.bind(this));

        } catch(e) {

            this.fireEvent('data', new Error('can\'t receive process usage data'));

        }

    }
});
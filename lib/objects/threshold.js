'use strict';
var EventDispatcher = require('appolo-express').EventDispatcher;

module.exports = EventDispatcher.define({

    $config: {
        id: 'threshold',
        singleton: false,
        inject: ['env']
    },

    constructor: function (data) {
        this._started = false;

        this._cpuThresholdConfigurations = data.cpu;
        this._memoryThresholdConfigurations = data.memory;

        this._isCpuThresholdTimer = null;
        this._isMemoryThresholdTimer = null;

        this._currentMonitorData = null;
    },

    getCpuConfigurations: function () {
        return this._cpuThresholdConfigurations;
    },

    getMemoryConfigurations: function () {
        return this._memoryThresholdConfigurations;
    },

    start: function () {
        this._started = true;
    },

    stop: function () {
        this._started = false;

        this._stopCpuThresholdTimer();
        this._stopMemoryThresholdTimer();
    },

    update: function (data) {
        if (this._started) {

            this._currentMonitorData = data;

            if (this._cpuThresholdConfigurations && this._cpuThresholdConfigurations.threshold && !isNaN(this._cpuThresholdConfigurations.duration)) {
                this._checkCpuThreshold(data.cpu);
            }

            if (this._memoryThresholdConfigurations && this._memoryThresholdConfigurations.threshold && !isNaN(this._memoryThresholdConfigurations.duration)) {
                this._checkMemoryThreshold(data.memory);
            }
        }
    },

    _checkCpuThreshold: function (cpu) {
        if (cpu > this._cpuThresholdConfigurations.threshold) {
            if (!this._isCpuThresholdTimer) {
                this._isCpuThresholdTimer = setTimeout(this._fireReachedEvent.bind(this), this._cpuThresholdConfigurations.duration);
            }
        } else {
            this._stopCpuThresholdTimer();
        }
    },

    _checkMemoryThreshold: function (memory) {
        if (memory > _.unhumanizeSize(this._memoryThresholdConfigurations.threshold)) {
            if (!this._isMemoryThresholdTimer) {
                this._isMemoryThresholdTimer = setTimeout(this._fireReachedEvent.bind(this), this._memoryThresholdConfigurations.duration);
            }
        } else {
            this._stopMemoryThresholdTimer();
        }
    },

    _stopCpuThresholdTimer: function () {
        clearTimeout(this._isCpuThresholdTimer);
        this._isCpuThresholdTimer = null;
    },

    _stopMemoryThresholdTimer: function () {
        clearTimeout(this._isMemoryThresholdTimer);
        this._isMemoryThresholdTimer = null;
    },

    _fireReachedEvent: function () {
        this.fireEvent('reached', this._currentMonitorData);
    }
});
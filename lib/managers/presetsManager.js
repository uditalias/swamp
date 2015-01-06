"use strict";
var appolo              = require('appolo-express'),
    EventDispatcher     = appolo.EventDispatcher,
    Q                   = require('q');

module.exports = EventDispatcher.define({
    $config: {
        id: 'presetsManager',
        singleton: true,
        properties: [
            {
                name: '_createPreset',
                factoryMethod: 'preset'
            }
        ],
        inject: ['env', 'swampServicesManager', 'db']
    },

    constructor: function () {
        this._presets = {};
    },

    initialize: function(presets) {

        var dbPresets = this.db.presets.find();

        _.forEach(presets, this._onEachPreset.bind(this, false));

        _.forEach(dbPresets, this._onEachPreset.bind(this, true));

    },

    serialize: function () {

        var presets = [];

        _.forEach(this._presets, function(preset) {
            presets.push(preset.serialize());
        });

        return presets;
    },

    getPresetById: function(id) {
        return this._presets[id];
    },

    getPresetByName: function(name) {
        return _.where(this._presets, function(preset) {
            return preset.getName() == name;
        })[0];
    },

    runPreset: function(id) {

        var preset = this.getPresetById(id);

        if(preset) {

            return this.swampServicesManager.applyPreset(preset);

        }

        return Q();
    },

    createPersistentPreset: function(presetDefinition) {

        if(presetDefinition.name && presetDefinition.services) {

            var preset = this.db.presets.save({ name: presetDefinition.name, services: presetDefinition.services });

            preset.in_storage = true;

            preset = this._createPreset(preset);

            this._presets[preset.id] = preset;

            this.fireEvent('created', preset);

        }
    },

    deletePersistentPreset: function(presetId) {

        var preset = this.db.presets.findOne({ _id: presetId });

        if(preset) {

            this.removePreset(presetId);

            this.db.presets.remove({ _id: presetId });

            this.fireEvent('deleted', presetId);
        }
    },

    removePreset: function(presetId) {
        delete this._presets[presetId];
    },

    _onEachPreset: function(isFromDatabase, presetDefinition) {
        if(presetDefinition.name && presetDefinition.services) {

            presetDefinition.in_storage = isFromDatabase;

            var preset = this._createPreset(presetDefinition);

            this._presets[preset.id] = preset;
        }
    }
});
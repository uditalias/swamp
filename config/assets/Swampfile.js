/*
 * Swampfile.js
 *
 * This file is a Swamp configurations file generated automatically
 *
 * Copyright (c) 2014 Udi Talias
 * Licensed under the MIT license.
 * https://github.com/uditalias/swamp/blob/master/LICENSE
 */

module.exports = function(swamp) {

    swamp.config({

        options: {

            silence: false,

            monitor: {

                cpu: true,

                memory: true

            },
            dashboard: {

                hostname: 'localhost',

                port: 2121,

                autoLaunch: true

            }
        },

        environments: [
            {
                name: "development",
                PORT: 8080
            },
            {
                name: "production",
                PORT: 80
            }
        ],

        services: []

    });

}
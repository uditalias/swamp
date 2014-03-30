# Swamp [![Build Status](https://travis-ci.org/uditalias/swamp.png?branch=master)](https://travis-ci.org/uditalias/swamp) [![Dependencies status](https://david-dm.org/uditalias/swamp.png)](https://david-dm.org/uditalias/swamp)

Swamp is the tool for running, managing and monitoring multiple node.js services. jump in!

> Swamp is the tool for running, managing and monitoring multiple node.js services, its the solution for developing multiple service
> application without the need to handle each one of them separately.

> When developing for the web with node.js, most of the time our application using many services (e.g. web server, socket server, REST api...),
> everytime we are starting the development process, we need to initialize each service separately, if we updates one service, we need to restart it, if we want to change
> the ENV, we need to restart it, if we want it to run forever and run again just after it’s crash, we need to do it manually.

> Swamp to the rescue! with Swamp you can do all of the above and lots of more automatically and in a very convenient way! With the Swamp dashboard you can keep tracking your services, get information like CPU and Memory usage of each service and restart your services with different ENV variables with no hard work. you can still using
> your favorite services like Grunt and Bower without any problem.

- - -
## Install

```sh
$ [sudo] npm install -g swamp
```

## Bootstrap your swamp project

```sh
$ mkdir myProject
$ cd myProject
$ swamp create
```
The `$ swamp create` command will create a Swamp bootstrap project inside `myProject` folder.


## Configure your Swamp

Edit or create the Swampfile.js to configure the swamp ([Full configurations](#usage-and-configurations)), here is an example:

```javascript
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
          autoLaunch: false,
          credentials: {
            username: "myUserName",
            password: "12345678!@#$%^&*"
          }
        }
      },
      environments: [
        {
          name: "staging",
          PORT: 8080,
          MY_PARAM: "myStageParamValue"
        }
      ],
      unix_sockets: [ '/var/run/my_unix_socket.sock' ],
      services: [
        {
          name: "myService 1",
          description: "",
          path: "/path/to/node/service",
          script: "app.js",
          options: {
            autorun: true,
            defaultEnv: "staging",
            restartOnChange: true,
            runForever: true,
            maxRetries: 5,
            maxLogsToSave: 100
          },
          environments: [
            {
              name: "production",
              PORT: 80
            }
          ],
          args: [ "arg1", 1234 ]
        },
        {
          name: "myService 2",
          description: "",
          path: "/path/to/any/service",
          command: "/path/to/any/service/python",
          args: [ '-u', 'my_server.py' ]
        }
      ]
    });
  
  }
```

## Usage and Configurations

Once the `swamp` command executes in the folder where the `Swampfile.js` is located, it will initialize and run your configurations, after that you can access your swamp dashboard from your browser (default: http://localhost:2121/).
 
The `Swampfile.js` exports a function as a node module, this function receives the Swamp as a parameter which your can config with the `swamp.config({ ... })` function which receives a configuration object.

### Use this configurations to config your swamp

####options

`options: { ... }` - set global swamp configurations

Type: `Object` Default: `{ silence: false, monitor: { cpu: true, memory: true }, dashboard: { port: 2121, autoLaunch: true } }`

#####options.silence

Type: `Boolean` Default: `false`

Make the Swamp logs silence and don't show logs on screen

#####options.monitor.cpu

Type: `Boolean` Default: `true`

Display or not cpu usage of each running service

#####options.monitor.memory

Type: `Boolean` Default: `true`

Display or not memory usage of each running service

#####options.dashboard.hostname

Type: `String` Default: `localhost`

Swamp dashboard host name

#####options.dashboard.port

Type: `Number|String` Default: `2121`

Swamp dashboard running port

#####options.dashboard.autoLaunch

Type: `Boolean` Default: `true`

Launch the dashboard when running `swamp`

#####options.dashboard.credentials

Type: `Object` Default: `{}`

Set a username and a password for your dashboard login (recommended if you're going to access the dashboard remotely)

#####options.dashboard.credentials.username

Type: `String` Default: ``

The dashboard username

#####options.dashboard.credentials.password

Type: `String` Default: ``

The dashboard password

####environments

`environments: [ ... ]` - set the swamp global environments variables

Type: `Array` Default: `[]`

You can config global environments in your swamp for easy environment params sharing between services, each environment variable is accessible through the `process.env` inside your swamp services, note that the `NODE_ENV` can be configure with the `name` key (e.g. `name: 'development'`), if both the `NODE_ENV` and `name` are configured on the same environment, the `name` will determine.

Example:
```javascript
{
  environments: [
    {
      name: "staging",
      PORT: 8080,
      MY_PARAM: "myStageParamValue"
    },
    {
      name: "production",
      PORT: 80,
      MY_PARAM: "myProdParamValue"
    }
    ...
  ]
}
```

####unix_sockets

Type: `Array` Default: `[]`

Config UnixSocket files for internal process communications. The array will accept list of socket files.
# Not that if the Socket file doesn't exist, Swamp will ignore it.

Example:
```javascript
{
  unix_sockets: [ '/path/to/unix/socket.sock' ]
}
```

####services

`services: [ ... ]` - config the swamp services

Type: `Array` Default: `[]`

Each nodejs server in your swamp called `service`, services are the way to tell Swamp how to run your servers.

You can configure many services as you want, the services object is an array of json objects, the service will run based in their order in the array, each service can be configure using this options:

#####name

Type: `String` (Mandatory)

Set the service name as it will shown in the dashboard (this field should be unique)

#####description

Type: `String`

Set the service description as it will shown in the dashboard

#####path

Type: `String` (Mandatory)

Set the service full path (e.g. `/home/user/servers/myServer`)
* Note that this field is mandatory, but their is an option to omit that field if your service is running along side with the `Swampfile.js` file.
 
#####script

Type: `String` (Mandatory if the `command` option is not set)

The service running script (e.g. `app.js`). This is a default to Node.JS script runner, to use a service other than node, use the `command` option

#####command

Type: `String` (Mandatory if the `script` option is not set)

The service running command (e.g. `/path/to/any/service/python`)
* Note that you need to use the `args` options in order to pass arguments to the command

#####options

Type: `Object` Default: `{ autorun: false, defaultEnv: "", restartOnChange: false, runForever: false, isParent: false }`

#####options.autorun

Type: `Boolean` Default: `false`

Run this service as soon as the swamp is started

#####options.defaultEnv

Type: `String` Default: `""`

This field is mandatory only if the `options.autorun` is set to `true`

#####options.restartOnChange

Type: `Boolean|Array` Default: `false`

Restart the service if file changes are detected in the service path. Can accept Array to select specific sub paths and file types to watch. (e.g. `['stylesheets/*.css', '**/*.js']`)

#####options.runForever

Type: `Boolean` Default: `true`

Keep this service alive, if it crash, run it again

#####options.maxRetries

Type: `Number` Default: `-1`

Max running retries in case of an error (for infinite: -1), relevant only if `runForever` is set to `true`

#####options.maxLogsToSave

Type: `Number` Default: `100`

Define the history log length for each service `out` and `error` logs

#####environments

Type: `Array` Default: `[]`

Just like the global environments, you can override environment variables defined on the global environments or just add new environments

#####args

Type: `Array` Default: `[]`

Pass arguments to your service

Fully configured service example:
```json
{
  "services": [
    {
      "name": "myService 1",
      "description": "this is my first service",
      "path": "/home/me/servers/myServer",
      "script": "app.js",
      "options": {
        "autorun": true,
        "defaultEnv": "staging",
        "restartOnChange": true,
        "runForever": false,
        "maxRetries": 5,
        "maxLogsToSave": 50
      },
      "environments": [
        {
          "name": "development",
          "PORT": 8080
        }
      ],
      "args": [ "arg1", 1234 ]
    }
  ]
}
```

## Running Swamp

```sh
$ cd /path/to/project/    # where the `Swampfile.js` is located
$ swamp
```
Then go to **http://localhost:2121** to see the magic...

---
##License

Copyright (c) 2014 Udi Talias

Licensed under the MIT License

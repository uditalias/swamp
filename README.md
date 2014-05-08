<img src="https://raw.githubusercontent.com/uditalias/swamp/master/config/assets/swamp_logo.png?rev=4" />
<br/>
[![Build Status](https://travis-ci.org/uditalias/swamp.png?branch=master)](https://travis-ci.org/uditalias/swamp) [![Dependencies status](https://david-dm.org/uditalias/swamp.png?theme=shields.io)](https://david-dm.org/uditalias/swamp)

Swamp is the tool for running, managing and monitoring multiple node.js services. jump in!


##Features

* Run any Node.JS, Python, Ruby and other services
* Keep services running again and again(...) automatically when they crash
* Swamp logs everything!
* Manage global environments and environments variables
* Manage environments and environments variables for each service
* Monitor CPU and Memory usage of each service
* Fully featured real-time Web Dashboard to control everything in the Swamp
* CLI to control swamp services from the shell
* Full REST API for hooking and receiving Swamp data - **Coming soon!**

- - -
## Install

```sh
$ [sudo] npm install -g swamp
```

## Swamp command options

Use the `swamp` command line tool to create and run your swamp

```
 $ swamp --help

     Usage: swamp [options]

     Options:

       -h, --help     output usage information
       -V, --version  output the version number
       -c, --create   creates a bootstrap `Swampfile.js` in the cwd
       -u, --up       startup the swamp with the cwd `Swampfile.js`
       -r, --reload   reload the current running swamp (will restart as a daemon)
       -d, --daemon   start the swamp as a daemon with the cwd `Swampfile.js`
       -k, --kill     stop the current cwd running swamp
       -s, --status   see the current cwd swamp status
       -C, --cli      connect to swamp cli

```

## Swamp CLI

After creating your Swampfile.js and your swamp is running, enter the Swamp CLI:

`$ swamp -C` or `$ swamp cli`

After connection you can use the following commands inside the shell:

`list` - list all your swamp services
`startall` - start all services
`restartall` - restart all running services
`stopall` - stop all running services
`start SERVICE_NAME` - start a service by service name
`stop SERVICE_NAME` - stop a service by service name
`restart SERVICE_NAME` - restart a service by service name
`exit` - logout from the swamp CLI and go back to prompt

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
      unix_sockets: [
        {
            file: '/var/run/my_unix_socket.sock',
            chmod: 0700
        }
      ]
      services: [
        {
          name: "myService 1",
          description: "myService 1 description",
          path: "/path/to/node/service",
          script: "app.js",
          options: {
            user: "udidu",
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
          description: "myService 2 description",
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

Type: `Object|Array` Default: `{}`

Set a username and a password for your dashboard login (recommended if you're going to access the dashboard remotely)

* Note that you can supply an array of objects for multi credentials (e.g. `[{ username: 'user',password: 'pass' }, { username: '...', password: '...' }, {...}]`)

#####options.dashboard.credentials.username

Type: `String` Default: ``

The dashboard username

#####options.dashboard.credentials.password

Type: `String` Default: ``

The dashboard password

####logs

Type: `Object` Default: `{ out: 'logs/out.log', err: 'logs/err.log' }`

Configure the main loggers of the Swamp for out and error logs.
The default log files will be located where the `Swampfile.js` is located, under the `logs` folder.
You are able to config log files rotation by size, the default file size for log rotation is `1MB`.

Here are some [log rotation configurations and examples](#log-rotation-configurations).

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

Config UnixSocket files for internal process communications. The array will accept list of socket files with an optional chmod.
* Note that if the Socket file doesn't exist, Swamp will ignore it.

Example:
```javascript
{
  unix_sockets: [
    {
        file: '/path/to/unix/socket.sock',
        chmod: 0700
    }
  ]
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

#####options.user

Type: `String` Default: `""`

Set this option to control the service permissions by specifying the UNIX username which will run this process.
This option is important if Swamp running as the root user.

#####options.autorun

Type: `Boolean` Default: `false`

Run this service as soon as the swamp is started

#####options.startIndex

Type: `Number` Default: `-1`

Define the services start order by setting the start index. You can use also negative numbers.

#####options.defaultEnv

Type: `String` Default: `""`

This field is mandatory only if the `options.autorun` is set to `true`

#####options.restartOnChange

Type: `Boolean|Array` Default: `false`

Restart the service if file changes are detected in the service path. Can accept Array to select specific sub paths and file types to watch. (e.g. `['stylesheets/*.css', '**/*.js']`)
* Note that if to many files specified, the watcher will not work and an error will be logged in the service error log.

#####options.runForever

Type: `Boolean` Default: `true`

Keep this service alive, if it crash, run it again

#####options.maxRetries

Type: `Number` Default: `-1`

Max running retries in case of an error (for infinite: -1), relevant only if `runForever` is set to `true`

#####options.minRuntime

Type: `Number` Default: `1000`

The minimum runtime (in milliseconds) for the service before running it again after error

#####options.maxLogsToSave

Type: `Number` Default: `100`

Define the history log length for each service `out` and `error` logs

#####environments

Type: `Array` Default: `[]`

Just like the global environments, you can override environment variables defined on the global environments or just add new environments

#####args

Type: `Array` Default: `[]`

Pass arguments to your service

#####logs

Type: `Object` Default: `{ out: 'SERVICE_NAME/out.log', err: 'SERVICE_NAME/err.log' }`

Configure the service logs for out and error logs.
The default log files will be located where the `Swampfile.js` is located, under the `SERVICE_NAME` folder.
You are able to config log files rotation by size, the default file size for log rotation is `1MB`.

Here are some [log rotation configurations and examples](#log-rotation-configurations).

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
      "logs": {
        "err": "/var/log/my_service/err.log",
        "out": "/var/log/my_service/out.log"
      },
      "args": [ "arg1", 1234 ]
    }
  ]
}
```

####Properties template

Any `string` property in the Swampfile can include properties templates, the value of those properties is taken from the
Swampfile itself. Here's a Swampfile example:

```json
{
    "params": {
        "user": "udidu",
        "projects_folder": "my_rojects_folder/dev"
    },

    "default_options": {
        "env": "development"
    },

    "services": [{
        "name": "myService 1",
        "description": "this is my first service",
        "path": "/home/<%= params.user %>/<%= params.projects_folder %>/myServer",
        "script": "app.js",
        "options": {
          "autorun": true,
          "defaultEnv": "<%= default_options.env %>",
          "restartOnChange": true,
          "runForever": false,
          "maxRetries": 5,
          "maxLogsToSave": 50
        },
    }]

}
```

###Log rotation configurations

When configuring your swamp and swamp services logs, you can pass an object to specify log rotations files size.
The default file size for log rotation is `1MB`. To change this size, change the `logs` object in you configurations
like so:

```json
    {
        "logs": {
            "out": {
                "path": "/var/log/services/myservice/out.log",
                "maxSize": "1MB"
            },
            "err": {
                "maxSize": "1.4MB"
            }
        }
    }
```

The example above shows how we pass the file size for log rotation. You can even pass just a `maxSize` property
to the log and the path will be the default log path.

Note that if you want to use the default value (`1MB`) you can pass the the `out` and `err` properties the string path.

For example:

```json
    {
        "logs": {
            "out": "/var/log/services/myservice/out.log"   //default log rotation file size will be `1MB`
            "err": {
                "maxSize": "1.4MB"
            }
        }
    }
```

#####Log rotation size examples

```
#KB     - e.g. 1KB, 2.4KB
#MB     - e.g. 1MB, 1.2MB
#GB     - e.g. 1GB, 0.5GB
#TB     - e.g. 1TB...
```

---
##License

Copyright (c) 2014 Udi Talias

Licensed under the MIT License

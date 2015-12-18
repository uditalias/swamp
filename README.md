<img src="https://raw.githubusercontent.com/uditalias/swamp/master/config/assets/swamp_logo.png?rev=4" />
<br/>
[![Npm Version](http://img.shields.io/npm/v/swamp.svg?style=flat)](https://www.npmjs.org/package/swamp)
[![Build Status](http://img.shields.io/travis/uditalias/swamp.svg?style=flat)](https://travis-ci.org/uditalias/swamp)
[![Downloads Status](http://img.shields.io/npm/dm/swamp.svg?style=flat)](https://www.npmjs.org/package/swamp)
[![Gittip Status](http://img.shields.io/gittip/uditalias.svg?style=flat)](https://www.gittip.com/uditalias)

Swamp is a tool for running, managing and monitoring processes. jump in!


##Features

* Run, monitor, keep alive and control multiple Node.js, Python, Ruby, Go, etc.. programs.
* Maintain process uptime: keep your processes running again and again(...) automatically when they crash.
* Great visibility into your processes logs. Including **live streaming** of STDERR and STDOUT logs into the dashboard, log rotation, etc.
* Manage applications environments and environments variables for each process, with full visibility what environment and environment variable are currently in use, **Live editing and adding of enviroment variables**
* Monitor CPU and Memory usage of each process
* Fully featured **real-time Web Dashboard** to control everything in the Swamp (No more supervisor "hit F5" frustration)
* Convenience features for common process supervising tasks such as "restart only running services".
* Fully fledged CLI to control Swamp processes from the shell
* Full REST API for hooking and receiving Swamp data

##Why Swamp

We built **Swamp** because we were frustrated with supervisor: ancient dashboard, having to manually reload the supervisor service when we had an ENV or code change and low visibility to logs and basic monitoring data, especially important when you are doing fast development cycles on a multi processes app. 

**Swamp** is still an alpha project, but is already used in some production servers and is quickly moving to stable status.

**Swamp** is built with [Appolo](https://github.com/shmoop207/appolo) a modern Node.js app framework, the dashboard is build with [Angular.js](https://github.com/angular/angular.js) . Want to contribute? see the Contributing section further on.
- - -

## Install

```sh
$ npm install -g swamp
```
Note, that if you are not using some kind of node environment manager (such as nvm) then you probably need ```sudo``` prefixing the previous command

### Installing swamp as a unix service

Warning: Currently the install script supports only upstart for ubuntu, But we would love your PR to support init-v, systemd, launchd (for osx) etc

```bash
./utils/bootstrap.sh
```

## Updating Swamp

Updating an already installed Swamp:

```sh
$ npm update -g swamp
```
sudo if necessary

## Usage: Swamp command options

Use the `swamp` command line tool to create and run your swamp

```
 $ swamp --help

     Usage: swamp [options]

       Options:

         -h, --help                output usage information
         -V, --version             output the version number
         -c, --create              creates a bootstrap `Swampfile.js` in the cwd
         -u, --up                  startup the Swamp with the cwd `Swampfile.js`
         -r, --reload              reload the current running Swamp (will restart as a daemon)
         -d, --daemon              start the Swamp as a daemon with the cwd `Swampfile.js`
         -t, --timeout <n>         use the timeout flag if you want to wait <n> milliseconds
         			               at most for blocking commands
         -H, --halt                halt the current cwd running Swamp
         -s, --status              see the current cwd Swamp status
         -C, --cli                 connect to the current cwd Swamp using the Swamp cli
         -D, --dashboard           open the Swamp Dashboard in your default browser
         -U, --update              check for Swamp updates
         --start <service_name>    start the given service
         --stop <service_name>     stop the given service
         --restart <service_name>  restart the given service
         --state <service_name>    see the given service state
         --startall                start all Swamp services
         --stopall                 stop all Swamp services
         --restartall              restart all Swamp services
         --stateall                see all Swamp services state
         --list                    simple list of swamp services with not extra data (e.g for scripting)
         --preset <preset_name>    apply a preset
         --vconf                   validates and checks the Swampfile.js
         -p, --path <swamp_path>   set the Swamp path [cwd]
         			               Important! use this option before any other option.
                                   e.g. `$ swamp -p ~/swamp_path --status`

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
      presets: [
        {
          name: 'My Preset',
          services: [ 'myService 1' ]
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
          args: [ '-u', 'my_server.py' ],
          threshold: {
            cpu: {
                threshold: 30,
                duration: 10 * 1000
            },
            memory: {
                threshold: '1.4GB',
                duration: 60 * 1000
            }
          }
        }
      ]
    });
  
  }
```

## Usage and Configurations

Once the `swamp` command executes in the folder where the `Swampfile.js` is located, it will initialize and run your configurations, another way is to use the `-p, --path` option to set the `Swampfile.js` location (see the [usage](#usage-swamp-command-options) section), after that you can access your swamp dashboard from your browser (default: http://localhost:2121/).
 
The `Swampfile.js` exports a function as a node module, this function receives the Swamp as a parameter which your can config with the `swamp.config({ ... })` function which receives a configuration object.

### Use this configurations to config your swamp

####options

`options: { ... }` - set global swamp configurations

Type: `Object` Default: `{ silence: false, monitor: { cpu: true, memory: true }, dashboard: { port: 2121, autoLaunch: true } }`

#####options.silence

Type: `Boolean` Default: `false`

Make the Swamp logs silence and don't show logs on screen

#####options.mode

Type: `String` Default: `local`

Set the swamp mode, can be set to `local` or `remote`

Use the `remote` option when running swamp in production server in order to prompt the user when performing actions in the dashboard (e.g. stop, start, restart services)

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

####commands

`commands: [ ... ]` - set global commands to run from the dashboard

Type: `Array` Default: `[]`

You can config commands in your swamp (e.g. `npm install`), this commands can be run in your services path from the dashboard.

Example:
```javascript

  commands: [
    {
      name: "npm install",
      cmd: "npm install"
    },
    {
      name: "pip install inside venv",
      cmd: "source venv/bin/activate && pip install -r requirements.txt"
    }
    ...
  ]
```

####presets

`presets: [ ... ]` - set presets to run only selected services

Type: `Array` Default: `[]`

When running a preset all the services in the Swamp will stop and only the preset services will start.

Presets can be defined in the `Swampfile.js` as shown below or they can be created from the dashboard.

Example:
```javascript

  presets: [
    {
      name: "My Preset",
      services: [ "my Service 1", "my Service 2" ]
    }
  ]
```

####unix_sockets

Type: `Array` Default: `[]`

Config UnixSocket files for internal process communications. The array will accept list of socket files with an optional chmod.
* Note that if the Socket file doesn't exist, Swamp will ignore it.

Example:
```javascript

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

Each application in your swamp called `service`, services are the way to tell Swamp how to run your servers.

You can configure many services as you want, the services object is an array of JSON objects, the service will run based in their order in the array, each service can be configure using this options:

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

Type: `Object` Default: `{ autorun: false, defaultEnv: "", runForever: false, isParent: false }`

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

#####options.runForever

Type: `Boolean` Default: `true`

Keep this service alive, if it crash, run it again

#####options.maxRetries

Type: `Number` Default: `-1`

Max running retries in case of an error (for infinite: -1), relevant only if `runForever` is set to `true`

#####options.minRuntime

Type: `Number` Default: `1000`

The minimum runtime (in milliseconds) for the service before running it again after error

#####options.restartGapFactor

Type: `Number` Default: `500`

The time (in milliseconds) gap between restarts after the service has failed

#####options.waitForReady

Type: `Boolean` Default: `false`

When `true`, the service will hang other services running sequence until the service is ready.

Sometimes, one of the services running sequence is asynchronous and should hang other services until this sequence has finished.
When the `waitForReady` service option is `true` the Swamp will wait until the service is ready before running the next `startIndex` service.
If you want to mark a `waitForReady` service as `ready`, send a message from the service when all async operations completed.

For example, in NodeJS service:

```js
    //...some async actions...

    process.send && process.send({ swamp: 'ready' });
```

In Python:
```python
    import os

    #...some async actions...

    os.write(0, '{"swamp" : "ready"}\n')

    # `0` is the index of the stdio swamp injects
    # to the service in order to pass messages/file descriptors
```

Note that the above would fail in python if the service isn't running from swamp, a safer alternative is:

```python

    def write_process_message(data, fd=0):
        try:
            os.write(fd, data)
        except OSError:
            sys.stdout.write(data)

    # and then somewhere in your code after the app has finished loading:
    write_process_message('{"swamp" : "ready"}\n', 0)
```


#####options.maxLogsToSave

Type: `Number` Default: `100`

Define the history log length for each service `out` and `error` logs, this option will not affect your log files, basically it tells to Swamp how much logs to save in memory for CLI and Dashboard use

#####options.killSignal

Type: `String` Default: `SIGTERM`

You can configure a specific kill signal as described in [Node Signal Events](http://nodejs.org/api/process.html#process_signal_events)

Supported values are `SIGTERM`, `SIGPIPE`, `SIGHUP`, `SIGINT`, `SIGBREAK`, `SIGKILL`, `SIGSTOP`


#####threshold

Type: `Object` Default: `{}`

Define the threshold object to control when the service will restart automatically if it reaches CPU/Memory thresholds.
You can config CPU and/or Memory thresholds like so:

#####threshold.cpu

Type: `Object` Default: `{}`

Define the CPU threshold to restart the service when it reaches the defined CPU threshold

Here is an example for CPU threshold, this configuration will restart the service when its CPU is above 50% for 6 seconds:

```json
    "threshold": {
        "cpu": {
            "threshold": 50,      //CPU threshold
            "duration": 6000      //Duration in milliseconds
        }
    }
```

#####threshold.memory

Type: `Object` Default: `{}`

Define the Memory threshold to restart the service when it reaches the defined Memory threshold

Here is an example for Memory threshold, this configuration will restart the service when its Memory is above 300MB for 6 seconds:

```json
    "threshold": {
        "memory": {
            "threshold": "300MB",  //Memory threshold
            "duration": 6000      //Duration in milliseconds
        }
    }
```

You can config both CPU and Memory thresholds together:

```json
    "threshold": {
        "cpu": {
            "threshold": 30,
            "duration": 10000
        },
        "memory": {
            "threshold": "1.4GB",
            "duration": 60000
        }
    }
```

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
          "runForever": false,
          "maxRetries": 5,
          "maxLogsToSave": 50
        },
    }]

}
```

###Log rotation configurations

When configuring your swamp and swamp services logs, you can pass an object to specify log rotations files size and
max files for rotation.

The default file size for log rotation is `1MB`, and the default for max files is `100`.

To change the size or max files, change the `logs` object in you configurations
like so:

```json
    {
        "logs": {
            "out": {
                "path": "/var/log/services/myservice/out.log",
                "maxSize": "1MB",
                "maxFiles": 4
            },
            "err": {
                "maxSize": "1.4MB",
                "maxFiles: 3
            }
        }
    }
```

The example above shows how we pass the file size for log rotation. You can even pass just a `maxSize` and/or `maxFiles` properties
to the log and the path will be the default log path.

Note that if you want to use the default value (`1MB`) you can pass the the `out` and `err` properties the string path.

For example:

```json
    {
        "logs": {
            "out": "/var/log/services/myservice/out.log"   //default log rotation file size will be `1MB`
            "err": {
                "maxSize": "1.4MB",
                "maxFiles": 50
            }
        }
    }
```

The Swamp handle logs with [winstonjs](https://github.com/winstonjs/winston) for Node.
If you want to read more about the `maxFiles` option for log rotation please refer to [winstonjs File Transport](https://github.com/winstonjs/winston/blob/master/docs/transports.md#file-transport)

#####Log rotation size examples

```
#KB     - e.g. 1KB, 2.4KB
#MB     - e.g. 1MB, 1.2MB
#GB     - e.g. 1GB, 0.5GB
#TB     - e.g. 1TB...
```

## API

### Full REST API for hooking and receiving Swamp data

Use the API to control Swamp services via HTTP, each API call should include an access token as described below.
All methods supported by JSONP `callback`.

The API base url is the same as the dashboard url and port (e.g. `http://localhost:2121/`)

Each API call should include the `x-access-token` header with a valid access token, if token is not provided or not valid
an `401` (Unauthorized) response will be returned.

#### Auth

##### check token

Path: `/api/auth/login/`
Method: `GET`

Verifies whether the access token is authorized or not

response:
<br/>
`200` if valid
<br/>
`401` if Unauthorized

##### login

Path: `/api/auth/login/`
Method: `POST`
Body: `username`, `password`

Login and get access token using your credentials

response:
<br/>
`200` if success. response body: `{ 'accessToken': VALID_ACCESS_TOKEN, 'lastTouch': LAST_SESSION_TOUCH_TIMESTAMP }`
<br/>
`400` if invalid credentials

##### logout

Path: `/api/auth/logout/`
Method: `POST`

Logout and delete the session

response:
<br/>
`200` if success.

#### Services

##### get service

Path: `/api/services/<SERVICE_NAME>/`
Method: `GET`

Get service data

response:
<br/>
`200` if service exist, response body: `{ SERIALIZED_SERVICE }`
<br/>
`404` if service not found

##### get all services

Path: `/api/services/`
Method: `GET`

Get all services data

response:
<br/>
`200`, response body: `[{ SERIALIZED_SERVICE },...]`

##### get service state

Path: `/api/services/<SERVICE_NAME>/state/`
Method: `GET`

Get service running state

response:
<br/>
`200` if service exist, response body: `{ 'name': SERVICE_NAME, 'state': SERVICE_STATE }`
<br/>
`404` if service not found

##### get all services state

Path: `/api/services/state/`
Method: `GET`

Get all services running state

response:
<br/>
`200`, response body: `[{ 'name': SERVICE_NAME, 'state': SERVICE_STATE },...]`

##### start service

Path: `/api/services/<SERVICE_NAME>/start/`
Method: `POST`

Start service

response:
<br/>
`200` if service exist
<br/>
`404` if service not found

##### start all services

Path: `/api/services/start/`
Method: `POST`

Start all services

response:
<br/>
`200`

##### stop service

Path: `/api/services/<SERVICE_NAME>/stop/`
Method: `POST`

Stop service

response:
<br/>
`200` if service exist
<br/>
`404` if service not found

##### stop all running services

Path: `/api/services/stop/`
Method: `POST`

Stop all running services

response:
<br/>
`200`

##### restart service

Path: `/api/services/<SERVICE_NAME>/restart/`
Method: `POST`

Restart service

response:
<br/>
`200` if service exist
<br/>
`404` if service not found

##### restart all running services

Path: `/api/services/restart/`
Method: `POST`

Restart all running services

response:
<br/>
`200`

## Contribute to the Swamp Dashboard project

`$ git clone git@github.com:uditalias/swamp.git`

Contributors who wants to contribute to the **Swamp dashboard** (separated in a different project) should also clone the dashboard project:
 =
`$ git clone git@github.com:uditalias/swamp-dashboard.git`

Both the Swamp and the Swamp-dashboard projects should be exist in the same directory, for example:

```
/projects
    |--swamp
    |--swamp-dashboard
```

In this way, when editing the dashboard, you can easily `add` and `commit` your changes to the swamp project
by running:

`$ grunt build` from the `swamp-dashboard` directory

this will build the dashboard, copy it to the `swamp` project, and then will perform `git add` and `git commit` to your dashboard changes in the swamp project.

---
##License

Copyright (c) 2014 Udi Talias

Licensed under the MIT License (Basically - do anything you want license). See [License](LICENSE) for more details.

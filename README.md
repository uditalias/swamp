# node-pool

Node Pool is the tool for running, managing and monitoring multiple node.js services in one place. jump in!

> Node Pool is the tool for running, managing and monitoring multiple node.js services in one place, its the solution for developing multiple service
> application without the need to handle each one of them separately.

> When developing for the web with node.js, most of the time our application using many services (e.g. web server, socket server, REST api...),
> everytime we are starting to develop we need to initialize each service separately, if we updates one service, we need to restart it, if we want to change
> the ENV, we need to restart it, if we want it to run forever and run again just after it’s crash, we need to do it manually.

> Node Pool to the rescue! with Node Pool you can do all of the above and lots of more automatically and in a very convenient way! you can still using
> your favorite services like Grunt and Bower without any problem.


- - -
## Install

```sh
$ [sudo] npm install -g node-pool
```

## Bootstrap your node-pool project

```sh
$ mkdir myProject
$ cd myProject
$ node-pool create
```
The `$ node-pool create` command will create a Node Pool bootstrap project inside `myProject` folder.


## Configure your Node Pool

Edit or create the Poolfile.js to configure the pool ([Full configurations](#usage-and-configurations)), here is an example:

```javascript
  module.exports = function(pool) {
  
    pool.config({
      options: {
        monitor: {
          cpu: true,
          memory: true
        },
        dashboard: {
          port: 6000,
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
            maxRetries: 5
          },
          environments: [
            {
              name: "production",
              PORT: 80
            }
          ],
          arguments: [ "arg1", 1234 ]
        },
        {
          name: "myService 2",
          description: "",
          path: "/path/to/node/service",
          ...
        }
      ]
    });
  
  }
```

## Usage and Configurations

Once the `node-pool` command executes in the folder where the `Poolfile.js` is located, it will initialize and run your configurations, after that you can access your pool dashboard from your browser (default: http://localhost:6000/).
 
The `Poolfile.js` exports a function as a node module, this function receives the Pool as a parameter which your can config with the `pool.config({ ... })` function which receives a configuration object.

### Use this configurations to config your pool

####options

`options: { ... }` - set global pool configurations

Type: `Object` Default: `{ monitor: { cpu: true, memory: true }, dashboard: { port: 6000, autoLaunch: true } }`

#####options.monitor.cpu

Type: `Boolean` Default: `true`

Display or not cpu usage of each running service

#####options.monitor.memory

Type: `Boolean` Default: `true`

Display or not memory usage of each running service

#####options.dashboard.port

Type: `Number|String` Default: `6000`

Node Pool dashboard running port

#####options.dashboard.autoLaunch

Type: `Boolean` Default: `true`

Launch the dashboard when running `node-pool`

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

`environments: [ ... ]` - set the pool global environments variables

Type: `Array` Default: `[]`

You can configure global environment variables in your pool for easy environment sharing between services, each envoronment variable is accessible through the `process.env` inside your pool services, note that the `NODE_ENV` can be configure with the `name` key (e.g. `name: 'development'`), if both the `NODE_ENV` and `name` are configured on the same environment, the `name` will determine.

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
####services

`services: [ ... ]` - config the pool services

Type: `Array` Default: `[]`

Each nodejs server in your pool called `service`, services are the way to tell Node Pool how to run your servers.

You can configure many services as you want, the services object is an array of json objects, the service will run based in their order in the array, each service can be configure using this options:

#####name

Type: `String` (Mandatory)

Set the service name as it will shown in the dashboard (this field should be unique)

#####description

Type: `String`

Set the service description as it will shown in the dashboard

#####path

Type: `String` (Mandatory)

Set the service full path (e.g. `/home/user/servers/myNodeServer`)
* Note that this field is mandatory, but their is an option to omit that field if your service is running along side with the `Poolfile.js` file.
 
#####script

Type: `String` (Mandatory)

The service running script (e.g. `app.js`)

#####options

Type: `Object` Default: `{ autorun: false, defaultEnv: "", restartOnChange: false, runForever: false, isParent: false }`

#####options.autorun

Type: `Boolean` Default: `false`

Run this service as soon as the pool is started

#####options.defaultEnv

Type: `String` Default: `""`

This field is mandatory only if the `options.autorun` is set to `true`

#####options.restartOnChange

Type: `Boolean` Default: `false`

Restart the service if file changes are detected in the service path

#####options.runForever

Type: `Boolean` Default: `true`

Keep this service alive, if it crash, run it again

#####options.maxRetries

Type: `Number` Default: `-1`

Max running retries in case of an error (for infinite: -1), relevant only if `runForever` is set to `true`

#####environments

Type: `Array` Default: `[]`

Just like the global environments, you can override environment variables defined on the global environments or just add new environments

#####arguments

Type: `Array` Default: `[]`

Pass arguments to your node service

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
        "isParent": false
      },
      "environments": [
        {
          "name": "development",
          "PORT": 8080
        }
      ],
      "arguments": [ "arg1", 1234 ]
    }
  ]
}
```

## Run Node Pool

```sh
$ cd /path/to/project/    # where the `Poolfile.js` is located
$ node-pool
```
Then go to **http://localhost:6000** to see the magic...

[0.0.28](https://github.com/uditalias/swamp/releases/tag/0.0.28)
* Partial fix for issue #43 (2) - now logs will be tailed
* Support for `max files` in log rotation
* Fixed log files orders in the service ioStream

[0.0.27](https://github.com/uditalias/swamp/releases/tag/0.0.27)
* Bug Fix: When stopping all services from the CLI twice (`swamp --stopall && swamp --stopall`) the CLI freezes
* Dashboard: Now the swamp agent will notify when the swamp dashboard disconnected

[0.0.26](https://github.com/uditalias/swamp/releases/tag/0.0.26)
* Bug Fix: when stopping all running services, all services (including stopped services) became pending
* Bug Fix: when restarting all running services, all services (including stopped services) became pending
* Dashboard: Added the option to view services in a grid view
* Dashboard: Options now saved as cookies
* Dashboard: Added the option to start, restart or stop service directly from the footer logs
* Dashboard: Added the swamp agent, the agent will speak when something important will happen

[0.0.25](https://github.com/uditalias/swamp/releases/tag/0.0.25)
* Feature: Swamp should show some indication when all child processes finish loading - Issue #38
* Bug Fix: When stopping a service that doesn't start and other service depend on (pending), when starting other services keep pending - Issue #40
* Bug Fix: Issue when service is starting and the dashboard displayed the service as started

[0.0.24](https://github.com/uditalias/swamp/releases/tag/0.0.24)
* Bug Fix: Fixed the crash when opening a service STDOUT, now the error will propagate to the client

[0.0.23](https://github.com/uditalias/swamp/releases/tag/0.0.23)
* Feature: Now only clients subscribed to services logs will receive logs in dashboard
* Bug Fix: Sometimes the log worker process fails and Swamp crashes
* Removed dependencies (winston-filerotatedate) - now using winston DailyRotateFile transport
* Updated dependencies (appolo-express 1.3.0 ^ 1.3.4)

[0.0.22](https://github.com/uditalias/swamp/releases/tag/0.0.22) - UNSTABLE - DO NOT INSTALL!
* Feature: Swamp error handling, add reference to bug tracking and exception info - Issue #41
* Swamp main log files is now handled in the main process instead of inside the logger worker

[0.0.21](https://github.com/uditalias/swamp/releases/tag/0.0.21)
* Add the option to silence logs from screen, dashboard and files
* Bug Fix: missing favicon! - Issue #42
* Updated dependencies (appolo-express 1.2.4 ^ 1.3.0)

[0.0.20](https://github.com/uditalias/swamp/releases/tag/0.0.20)
* Database now created for each Swamp inside each the swamp project folder
* Feature: Create and run Services Presets from dashboard and CLI

[0.0.19](https://github.com/uditalias/swamp/releases/tag/0.0.19)
* Bug Fix: Hard kill for zombie processes
* Feature: Added the Swamp Connect option
* Feature: Get list of services from the API

[0.0.18](https://github.com/uditalias/swamp/releases/tag/0.0.18)
* Feature: Fully featured services HTTP API
* Feature: New authentication method with json web tokens to auth against the swamp socket and the new HTTP API
* Feature: Run commands inside service dir directly from the dashboard
* Feature: Database added in order to save Swamp config params and sessions
* Bug Fix: Swampfile validation option - Issue #37
* Bug Fix: Swamp has no error when another service is running on the same dashboard port - Issue #35
* Deprecated: Watching files option has been removed along with the `restartOnChange` service option
* Added swamp tests using Bats
* Updated dependencies

[0.0.17](https://github.com/uditalias/swamp/releases/tag/0.0.17)
* Feature: when waiting for a process to start (with wait for ready) show status in different color and text - Issue #34
* Bug Fix: --restartall behavior is wrong - Issue #33
* Bug Fix: Suspected file descriptor leak - Issue #32
* Bug Fix: "started" time is sometimes wrong and doesn't always reflect process restarts - Issue #31
* Bug Fix: Swamp crash and stability issues - Issue #29
* Bug Fix: In consistent behavior - with the waitForReady feature - Issue #28
* Bug Fix: swamp own logs are lacking - Issue #27
* Bug Fix: Swamp.io stderr/stdout feature - Issue #25
* Dashboard: Added the option to parse logs as HTML
* Dashboard: Now `starting` services marked as `starting` instead of `stopped` or `pending`
* Updated dependencies

[0.0.15](https://github.com/uditalias/swamp/releases/tag/0.0.15)
* Bug Fix: fixed 'freeze' bug when service 'error' or 'close' events raised
* Feature: Added support for pending services when restart all running or start all services
* Dashboard: upgrade to angular 1.3.0-rc.3 and issues fix

[0.0.14](https://github.com/uditalias/swamp/releases/tag/0.0.14)
* Feature: Added the option to check Swamp updates from the CLI using the command `$ swamp --update`
* Dashboard: Fixed view issues

[0.0.13](https://github.com/uditalias/swamp/releases/tag/0.0.13)
* Feature: Added the service option `waitForReady` in order to hang other services from running before an async service is ready
* Feature: Added the Force Stop for services in dashboard services context menus in order to stop gap factors when service in sleep phase

[0.0.12](https://github.com/uditalias/swamp/releases/tag/0.0.12)
* Bug Fix: When using the `restartGapFactor` service option, the service started even if the stop was manually by the user

[0.0.11](https://github.com/uditalias/swamp/releases/tag/0.0.11)
* Feature: Added the option to check the Swampfile syntax for errors before running, See the `vconf` option - Issue #20
* Feature: Added the option to define the time gap between restarts after the service has failed - Issue #22
* Bug Fix: When reloading the swamp (using `$ swamp --reload`) sometimes the swamp didn't started

[0.0.10](https://github.com/uditalias/swamp/releases/tag/0.0.10)
* Feature: Added the option to send a different kill signal for each swamp service
* Feature: Added the option to set a `mode` for the swamp (`local` or `remote`)
* Feature: Prompt the user when trying to perform dashboard actions when swamp runs in `remote` mode (stop, start or restart service)
* Dashboard: Some design changes as (antonzy)[https://github.com/antonzy] asked :)

[0.0.9](https://github.com/uditalias/swamp/releases/tag/0.0.9)
* Bug Fix: fix major bug when running cli command too quickly after running daemon mode

[0.0.8](https://github.com/uditalias/swamp/releases/tag/0.0.8)
* Feature: Specify a config file to use from the cli - Issue #5
* Feature: Add links to full logs download - Issue #16
* Feature: Added context menus to services in dashboard
* Bug Fixes

[0.0.7](https://github.com/uditalias/swamp/releases/tag/0.0.7)
* Feature: Added search in logs - Issue #8
* Feature: Added ability to choose which log panels are displayed - Issue #13
* Bug Fix: When stopping or starting a process few times too quickly, the swamp crashes - Issue #14

[0.0.6](https://github.com/uditalias/swamp/releases/tag/0.0.6)
* Change: Swamp -k, --kill changed to -H, --halt
* Feature: Clear all logs button in Dashboard
* Feature: Added Environments Editor - Modify service environments from dashboard at runtime
* Feature: Added the option to open the dashboard from the cli. ($ swamp -D or $ swamp --dashboard)
* Bug Fix: When halting swamp, now waiting to the processes to exit
* Bug Fix: Memory leak in dashboard
* Performance: Don't send monitor (cpu/memory) logs when data didn't changed
* Performance: Don't send monitor data if options for monitor are disabled

[0.0.5](https://github.com/uditalias/swamp/releases/tag/0.0.5)
* Feature: Pause logs option added to dashboard
* Feature: Show when Swamp is killed or reloading
* Feature: Added the option to see services state in CLI
* Bug Fix: When can't connect to CLI (catch the error event)

[0.0.4](https://github.com/uditalias/swamp/releases/tag/0.0.4)
* Feature: Added CLI command options to stop, start and restart swamp services
* Bug Fixes

[0.0.3](https://github.com/uditalias/swamp/releases/tag/0.0.3)
* Bug Fix: listening to child process error event

[0.0.2](https://github.com/uditalias/swamp/releases/tag/0.0.2)
* Feature: Added Swamp CLI
* Bug Fixes

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

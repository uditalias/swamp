[0.0.7](https://github.com/uditalias/swamp/releases/tag/0.0.7)
* Feature: Added search in logs - Issue #8
* Feature: Added ability to choose which log panels are displayed - Issue #13
* Bug Fix: When stopping or starting a process few times too quickly, the swamp crashes - Issue #14

[0.0.6](https://github.com/uditalias/swamp/releases/tag/0.0.6)
* Change: Swamp -k, --kill changed to -H, --halt
* Feature: Clear all logs button
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
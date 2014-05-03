/*
 *  This script will print out the UNIX user id converted from a user name string.
 *
 *  DO NOT! load this script with node's `require` function as it will change
 *  the main process user id!
 *
 *  This script will run only with `child_process.execFile()` as a child
 *  process.
 */

var argv = process.argv.slice(2),
    user = argv[0] || process.getuid();

if (!isNaN(user)) user = +user;

try {
    process.setuid(user)
    console.log(JSON.stringify({ err: null, uid: +process.getuid() }));
} catch (e) {
    console.log(JSON.stringify({ err: e.message, uid: null }));
}
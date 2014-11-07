#! /usr/bin/env bats
@test "Check that the swamp client is available" {
    command -v swamp
}

@test "Check swamp -h prints usage" {
   run swamp -h 
   [ "$status" -eq 0 ]
   [ "${lines[0]}" = "  Usage: swamp [options]" ]
}

@test "Check swamp -d runs as daemon mode" {
  run swamp valid/Swampfile.js -d
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "Validating Swamp configurations..." ]
  [ "${lines[3]}" = "* running swamp..." ]
  run swamp -H
}

@test "Check starting a service actually starts the service" {

}

@test "Check stopping a runnign service kills the service" {

}

@test "Check Swamp respects boot order and wait for ready" {

}

@test "Check swamp vconf validates configuration" {

}

@test "Check can't run swamp -d more then once with the same Swampfile" {

}

@test "Check swamp -r reloads configuration file" {

}

#! /usr/bin/env bats

teardown() {
  echo "Teardown test"
  echo "$BATS_TEST_NAME"
  run swamp -p bats/valid/ -H
  run swamp -p bats/invalid/ -H

}
@test "Check that the swamp client is available" {
    command -v swamp
}

@test "Check swamp -h prints usage" {
   run swamp -h 
   [ "$status" -eq 0 ]
   [ "${lines[0]}" = "  Usage: swamp [options]" ]
}

@test "Check swamp -d runs as daemon mode and swamp -H stops it" {
  run swamp -p bats/valid -d
  [ "$status" -eq 0 ]
  [[ "${lines[0]}" =~ "Validating Swamp configurations..." ]]
  [[ "${lines[2]}" =~ "running swamp" ]]
  sleep 1
  run bash -c "ps aux | grep -v grep | grep -i -e VSZ -e python-app | wc -l "
  [ "$output" -eq 2 ]
  run swamp -p bats/valid/ -H
  run bash -c "ps aux | grep -v grep | grep -i -e VSZ -e python-app | wc -l "
  [ "$output" -eq 1 ]
}

@test "Check stopping and starting a service actually starts the service" {
  
  run swamp -p bats/valid/ -d
  [[ "${lines[0]}" =~ "Validating Swamp configurations..." ]]
  [[ "${lines[2]}" =~ "running swamp" ]]
  sleep 1
  run swamp -p bats/valid/ --start test-app1

  sleep 1
  run bash -c "ps aux | grep -v grep | grep -i -e VSZ -e python-app | wc -l "
  [ "$output" -eq 2 ]
  
  run swamp -p bats/valid/ --stop test-app1
  sleep 1
  run bash -c "ps aux | grep -v grep | grep -i -e VSZ -e python-app | wc -l "
  [ "$output" -eq 1 ]

}

@test "Dashboard is running" {
  run swamp -p bats/valid -d
  sleep 1
  run bash -c "curl localhost:2121 | grep swampVersion"
  [ "$status" -eq 0 ]
}


@test "Check Swamp respects boot order and wait for ready" {

}

@test "Check dashboard returns 401 on unauthorized access" {


}

@test "Check swamp vconf validates configuration" {
  run swamp -p bats/invalid -d
  [[ "$output" =~ 'Invalid' ]]

  run bash -c "ps aux | grep -v grep | grep -i -e VSZ -e python-app | wc -l "
  [ "$output" -eq 1 ]
}

@test "Check can't run swamp -d more then once with the same Swampfile" {

  run swamp -p bats/valid -d
  sleep 1
  run swamp -p bats/valid -d
  [[ "${lines[2]}" =~ "swamp is already running" ]] 
}

@test "Check list returns list of services" {
  run swamp -p bats/valid -d
  sleep 1
  run swamp -p bats/valid --list
  [[ "${lines[1]}" =~ "test-app1" ]]
}

@test "Check stateall returns list of services" {
  run swamp -p bats/valid -d
  sleep 1
  run swamp -p bats/valid --stateall
  [[ "${lines[1]}" =~ "test-app1" ]]
}


@test "Check swamp -r reloads configuration file" {

}

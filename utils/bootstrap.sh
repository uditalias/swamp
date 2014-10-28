#!/bin/sh

set -e
INSTALL_PATH=~/.swamp
read -p "Swampfile installation path? (Defaults for $INSTALL_PATH)" -r REPLY
echo  # move line

if [ -n "$REPLY" ]; then
  INSTALL_PATH="$REPLY"
fi

eval INSTALL_PATH=$INSTALL_PATH
echo $INSTALL_PATH

mkdir -pv $INSTALL_PATH

RUN_USER=$(id -u -n)
read -p "User to run swamp as (defaults to $RUN_USER)" -r REPLY

if [ -n "$REPLY" ]; then
  RUN_USER="$REPLY"
fi


RUN_GROUP=$(id -g -n)
read -p "Group to run swamp as (defaults to $RUN_GROUP)" -r REPLY

if [ -n "$REPLY" ]; then
  RUN_GROUP="$REPLY"
fi


#check for upstart which initctl
BASE_UTIL_DIR="$(cd $(dirname $0) && pwd)"

if which initctl; then
  cp $BASE_UTIL_DIR/init/swamp.conf /tmp/swamp.conf

  sed -i s/username/$RUN_USER/ /tmp/swamp.conf
  sed -i s/groupname/$RUN_GROUP/ /tmp/swamp.conf

# working around the slash issue
  sed -i "s~installpath~$INSTALL_PATH~" /tmp/swamp.conf

  sudo cp /tmp/swamp.conf /etc/init/swamp.conf

else

    echo "This is an upstart script, but upstart doesn't seem to be installed, No systemd support yet"
fi


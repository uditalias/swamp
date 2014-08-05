#!/bin/sh

set -e
INSTALL_PATH=~/.swamp
read -p "Swampfile installation path? (Defaults for $INSTALL_PATH)" -r REPLY
echo  # move line

if [ -n "$REPLY" ]; then
  INSTALL_PATH="$REPLY"
fi
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
if which initctl; then
  cp ./initscripts/upstart/swamp.conf /tmp/swamp.conf

  sed -i s/username/$RUN_USER/ /tmp/swamp.conf
  sed -i s/groupname/$RUN_GROUP/ /tmp/swamp.conf

  cp /tmp/swamp.conf /etc/init/swamp.conf

fi


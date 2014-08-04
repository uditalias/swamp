#!/bin/sh
INSTALL_PATH=~/.swamp
read -p "Swampfile installation path? (Defaults for $INSTALL_PATH)"
mkdir -pv $INSTALL_PATH

RUN_USER=$(ld -u -n)
read -p "User to run swamp as (defaults to $RUN_USER)"

RUN_GROUP=$(ld -g -n)
read -p "Group to run swamp as (defaults to $RUN_GROUP)"

#check for upstart which initctl
cp ./initscripts/upstart/swamp.conf /tmp/swamp.conf

sed -i s/username/$RUN_USER/ /tmp/swamp.conf
sed -i s/groupname/$RUN_GROUP/ /tmp/swamp.conf

cp /tmp/swamp.conf /etc/init/swamp.conf


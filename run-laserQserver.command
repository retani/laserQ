#!/bin/bash
cd /Users/holger/laserQserver
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist
sleep 2
sleep 8 && open "/Applications/Google Chrome.app" --args --kiosk &
cat startup_message.txt
echo "press control-c to abort"
node server.js


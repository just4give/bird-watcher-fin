#!/bin/bash
cat /proc/asound/cards

amixer set Micro 80%
amixer set Master 80%
alsactl store

# arecord -d4 --rate=44000 test.wav&
# speaker-test -l1 -c2 -t wav
# aplay test.wav

echo "starting nodejs voice inference engine ..."
node server.js
echo "stopping nodejs voice inference engine ..."
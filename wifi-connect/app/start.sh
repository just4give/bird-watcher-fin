#!/usr/bin/env bash

export PORTAL_LISTENING_PORT=8100
export PORTAL_SSID=BIRD-WIFI-AP
# Optional step - it takes couple of seconds (or longer) to establish a WiFi connection
# sometimes. In this case, following checks will fail and wifi-connect
# will be launched even if the device will be able to connect to a WiFi network.
# If this is your case, you can wait for a while and then check for the connection.
sleep 15



while [[ true ]]; do
  # Choose a condition for running WiFi Connect according to your use case:

  # 1. Is there a default gateway?
  # ip route | grep default

  # 2. Is there Internet connectivity?
  # nmcli -t g | grep full

  # 3. Is there Internet connectivity via a google ping?
  wget --spider http://google.com 2>&1

  # 4. Is there an active WiFi connection?
  #iwgetid -r

  if [ $? -eq 0 ]; then
      printf 'Skipping WiFi Connect\n'
  else
      printf 'Starting WiFi Connect\n'
      # Start wifi-connect with SSID "balenaFin", Password "balenaFin" and make it exit if no interaction happens within 10 minutes.
      ./wifi-connect -a 600
  fi
  # wait 1 minute before checking again for internet connectivity
  sleep 60
done
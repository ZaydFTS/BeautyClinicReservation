#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting telegram poller..."
  bun run mini-services/telegram-poller/index.ts >> mini-services/telegram-poller.log 2>&1
  echo "[$(date)] Poller exited, restarting in 3s..."
  sleep 3
done

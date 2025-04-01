#!/bin/bash

# Script to find an available port
# Usage: ./find-port.sh [start_port]

START_PORT=${1:-4000}
PORT=$START_PORT
MAX_PORT=$((START_PORT + 100))

# First, try to kill any process that might be using our default port range
for p in $(seq $START_PORT $((START_PORT + 10))); do
  pid=$(lsof -ti :$p 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo "Killing process $pid on port $p"
    kill -9 $pid 2>/dev/null
  fi
done

# Now find an available port
while (lsof -i :$PORT 2>/dev/null || netstat -an 2>/dev/null | grep -q ".$PORT ") && [ $PORT -lt $MAX_PORT ]; do
  echo "Port $PORT is in use, trying next port..."
  PORT=$((PORT + 1))
done

if [ $PORT -lt $MAX_PORT ]; then
  echo "Found available port: $PORT"
  echo "PORT=$PORT" > .env.port
  exit 0
else
  echo "Could not find an available port in range $START_PORT-$MAX_PORT"
  exit 1
fi
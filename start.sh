#!/usr/bin/env bash
# Starts the Nyaya backend, which also serves the frontend statically.
# Run from anywhere: ./start.sh

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$DIR/backend/node_modules" ]; then
  echo "==> Dependencies not found. Run ./install.sh first."
  exit 1
fi

cd "$DIR/backend"
npm start

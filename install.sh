#!/usr/bin/env bash
# Installs backend dependencies and sets up a local .env file.
# Run from anywhere: ./install.sh

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Installing backend dependencies"
cd "$DIR/backend"
npm install

if [ ! -f .env ]; then
  cp .env.example .env
  echo "==> Created backend/.env from .env.example"
  echo "    Add ANTHROPIC_API_KEY there to enable Claude-powered classification."
else
  echo "==> backend/.env already exists — leaving it as is"
fi

echo "==> Install complete. Run ./start.sh to launch Nyaya."

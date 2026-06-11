#!/bin/sh
set -e
echo "Running database migrations..."
npm run migrate
if [ -f seed.sql ] && [ "${RUN_SEED:-0}" = "1" ]; then
  echo "Running database seed..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f seed.sql
fi
echo "Starting API..."
if [ "${DEV_WATCH:-0}" = "1" ]; then
  exec npx tsx watch server.ts
else
  exec node dist/server.js
fi

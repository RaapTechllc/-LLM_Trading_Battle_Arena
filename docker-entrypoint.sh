#!/bin/sh
set -e

# Run Prisma migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running Prisma migrations..."
  npx prisma migrate deploy || echo "Warning: migrations failed, continuing..."
fi

exec "$@"

#!/bin/bash
set -e

echo "Building api-server..."
pnpm --filter @workspace/api-server run build

echo "Building creator-toolbox..."
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/creator-toolbox run build

echo "Pushing database schema..."
pnpm --filter @workspace/db run push-force

echo "Seeding database..."
pnpm --filter @workspace/db run seed

echo "Build complete."

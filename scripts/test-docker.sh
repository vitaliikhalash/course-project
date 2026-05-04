#!/usr/bin/env bash

set -euo pipefail

cleanup() {
  if [[ -n "${APP_PID:-}" ]] && kill -0 "${APP_PID}" 2>/dev/null; then
    kill "${APP_PID}" 2>/dev/null || true
    wait "${APP_PID}" 2>/dev/null || true
  fi
  if [[ -n "${HOST_UID:-}" ]] && [[ "${HOST_UID}" =~ ^[0-9]+$ ]] && [[ "${HOST_UID}" != "0" ]]; then
    chown -R "${HOST_UID}:${HOST_GID:-${HOST_UID}}" /workspace 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "Installing npm dependencies..."
npm ci

echo "Waiting for PostgreSQL..."
until pg_isready -h postgres -p 5432 -U postgres -d app_test >/dev/null 2>&1; do
  sleep 1
done

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Running Vitest suite..."
npm run test:unit

echo "Building Next.js app..."
npm run build

echo "Starting Next.js app for Playwright..."
npm run start &
APP_PID=$!

echo "Waiting for app readiness at ${PLAYWRIGHT_BASE_URL:-http://127.0.0.1:3000}..."
for _ in $(seq 1 60); do
  if curl --fail --silent "${PLAYWRIGHT_BASE_URL:-http://127.0.0.1:3000}" >/dev/null; then
    break
  fi
  sleep 1
done

echo "Running Playwright suite..."
npm run test:e2e

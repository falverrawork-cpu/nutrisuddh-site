#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/nutrisuddh-site"

echo "[1/6] Updating repository..."
cd "$APP_DIR"
git fetch origin
git checkout main
git pull origin main

echo "[2/6] Installing dependencies..."
npm install

echo "[3/6] Building frontend and backend..."
npm run build

echo "[4/6] Fixing backend data permissions..."
mkdir -p "$APP_DIR/backend/data/invoices"
chown -R www-data:www-data "$APP_DIR/backend/data"

echo "[5/6] Restarting backend service..."
sudo systemctl restart nutrisuddh-backend
sudo systemctl status nutrisuddh-backend --no-pager

echo "[6/6] Reloading nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "[7/7] Done."
echo "Website should now be live."

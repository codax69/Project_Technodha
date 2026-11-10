#!/usr/bin/env bash
set -euo pipefail

# UID / GID Mappings:
# Traefik: 1000:1000 (+ Docker socket group)
# Caddy:   1000:1000
# Backend: 1001:1001

echo "==> Creating required host directories and ACME storage..."
mkdir -p caddy/data caddy/config
mkdir -p certificates/letsencrypt

# ACME storage file for Traefik requires strict 600 permissions
touch certificates/letsencrypt/acme.json
chmod 600 certificates/letsencrypt/acme.json
chown -R 1000:1000 certificates/letsencrypt

echo "==> Setting permissions for Caddy volumes (UID 1000:1000)..."
chown -R 1000:1000 caddy/data caddy/config
chmod -R 770 caddy/data caddy/config

echo "==> Setting read permissions for configs (644)..."
chmod 644 caddy/Caddyfile traefik/traefik.yml

# Identify Docker socket GID for non-root Traefik group_add
DOCKER_GID=$(stat -c '%g' /var/run/docker.sock 2>/dev/null || echo "999")
echo "==> Docker socket GID detected: ${DOCKER_GID}"
touch .env
if ! grep -q "^DOCKER_GID=" .env; then
    echo "DOCKER_GID=${DOCKER_GID}" >> .env
fi

echo "==> Host permissions and ACME storage ready."

#!/usr/bin/env bash
set -euo pipefail

CURRENT_UID=$(id -u)
CURRENT_GID=$(id -g)

echo "==> Creating required host directories and ACME storage..."
mkdir -p caddy/data caddy/config
mkdir -p certificates/letsencrypt

# ACME storage file for Traefik requires strict 600 permissions
touch certificates/letsencrypt/acme.json
chmod 600 certificates/letsencrypt/acme.json
chmod 700 certificates/letsencrypt
chmod -R 770 caddy/data caddy/config 2>/dev/null || true

# Attempt chown only if root or non-interactive sudo is available
if [ "$CURRENT_UID" -eq 0 ]; then
    chown -R 1000:1000 certificates/letsencrypt caddy/data caddy/config 2>/dev/null || true
elif command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    sudo chown -R "${CURRENT_UID}:${CURRENT_GID}" certificates/letsencrypt caddy/data caddy/config 2>/dev/null || true
fi

echo "==> Setting read permissions for configs (644)..."
chmod 644 caddy/Caddyfile traefik/traefik.yml 2>/dev/null || true

# Identify Docker socket GID for non-root Traefik group_add
DOCKER_GID=$(stat -c '%g' /var/run/docker.sock 2>/dev/null || echo "999")
echo "==> Runtime User: ${CURRENT_UID}:${CURRENT_GID}, Docker socket GID: ${DOCKER_GID}"

touch .env
if ! grep -q "^UID=" .env; then
    echo "UID=${CURRENT_UID}" >> .env
fi
if ! grep -q "^GID=" .env; then
    echo "GID=${CURRENT_GID}" >> .env
fi
if ! grep -q "^DOCKER_GID=" .env; then
    echo "DOCKER_GID=${DOCKER_GID}" >> .env
fi

echo "==> Host permissions and ACME storage ready."

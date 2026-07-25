#!/usr/bin/env bash
# Automated Dual Domain SSL Certificate Initialization Script

DOMAINS="techstore.pritesh.site api.techstore.pritesh.site"
PRIMARY_DOMAIN="techstore.pritesh.site"
EMAIL="admin@pritesh.site"
DATA_PATH="./certbot"
STAGING=0 # Set to 1 if testing to avoid hitting Let's Encrypt rate limits

if [ ! -e "$DATA_PATH/conf/options-ssl-nginx.conf" ] || [ ! -e "$DATA_PATH/conf/ssl-dhparams.pem" ]; then
  echo ">>> Downloading recommended TLS parameters..."
  mkdir -p "$DATA_PATH/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$DATA_PATH/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$DATA_PATH/conf/ssl-dhparams.pem"
fi

# Detect whether a valid SSL certificate already exists
HAS_EXISTING_CERT=0
if [ -f "$DATA_PATH/conf/live/$PRIMARY_DOMAIN/fullchain.pem" ]; then
  HAS_EXISTING_CERT=1
fi

if [ $HAS_EXISTING_CERT -eq 0 ]; then
  echo ">>> Creating dummy certificate for $DOMAINS to allow initial Nginx startup..."
  path="/etc/letsencrypt/live/$PRIMARY_DOMAIN"
  mkdir -p "$DATA_PATH/conf/live/$PRIMARY_DOMAIN"
  docker compose run --rm --entrypoint "\
    openssl req -x509 -nodes -newkey rsa:2048 -days 1\
      -keyout '$path/privkey.pem' \
      -out '$path/fullchain.pem' \
      -subj '/CN=localhost'" certbot

  echo ">>> Starting Nginx..."
  docker compose up -d frontend

  echo ">>> Deleting dummy certificate for $PRIMARY_DOMAIN..."
  docker compose run --rm --entrypoint "\
    rm -Rf /etc/letsencrypt/live/$PRIMARY_DOMAIN && \
    rm -Rf /etc/letsencrypt/archive/$PRIMARY_DOMAIN && \
    rm -Rf /etc/letsencrypt/renewal/$PRIMARY_DOMAIN.conf" certbot

  echo ">>> Requesting Let's Encrypt SSL certificate for $DOMAINS..."
  domain_args=""
  for domain in $DOMAINS; do
    domain_args="$domain_args -d $domain"
  done

  # Select email arg
  case "$EMAIL" in
    "") email_arg="--register-unsafely-without-email" ;;
    *) email_arg="--email $EMAIL" ;;
  esac

  # Enable staging if requested
  if [ $STAGING -ne 0 ]; then staging_arg="--staging"; fi

  docker compose run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
      $staging_arg \
      $email_arg \
      $domain_args \
      --rsa-key-size 4096 \
      --agree-tos" certbot

  echo ">>> Restarting Nginx with new multi-domain certificate..."
  docker compose up -d --force-recreate frontend

  echo "✅ Dual Domain SSL Certificate setup complete for $DOMAINS!"
else
  echo ">>> Real certificate found for $PRIMARY_DOMAIN. Starting Nginx..."
  docker compose up -d frontend
  docker compose exec frontend nginx -s reload || docker compose up -d --force-recreate frontend
  echo "✅ Nginx started with existing SSL certificate for $DOMAINS!"
fi

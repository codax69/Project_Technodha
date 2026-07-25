#!/usr/bin/env bash
# Automated SSL Certificate Initialization Script for techstore.pritesh.site

DOMAINS="techstore.pritesh.site"
EMAIL="admin@pritesh.site"
DATA_PATH="./certbot"
STAGING=0 # Set to 1 if testing to avoid hitting Let's Encrypt rate limits

if [ ! -e "$DATA_PATH/conf/options-ssl-nginx.conf" ] || [ ! -e "$DATA_PATH/conf/ssl-dhparams.pem" ]; then
  echo ">>> Downloading recommended TLS parameters..."
  mkdir -p "$DATA_PATH/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$DATA_PATH/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$DATA_PATH/conf/ssl-dhparams.pem"
fi

echo ">>> Creating dummy certificate for $DOMAINS to allow Nginx startup..."
path="/etc/letsencrypt/live/$DOMAINS"
mkdir -p "$DATA_PATH/conf/live/$DOMAINS"
docker compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:2048 -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo ">>> Starting Nginx..."
docker compose up --force-recreate -d frontend

echo ">>> Deleting dummy certificate for $DOMAINS..."
docker compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAINS && \
  rm -Rf /etc/letsencrypt/archive/$DOMAINS && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAINS.conf" certbot

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
    --agree-tos \
    --force-renewal" certbot

echo ">>> Reloading Nginx..."
docker compose exec frontend nginx -s reload

echo "✅ SSL Certificate setup complete for $DOMAINS!"

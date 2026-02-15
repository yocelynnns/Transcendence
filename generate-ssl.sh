#!/bin/sh
set -e

SSL_DIR="/etc/ssl"
DOMAIN="localhost"
DAYS_VALID=365

if [ ! -f "$SSL_DIR/server.key" ] || [ ! -f "$SSL_DIR/server.crt" ]; then
    echo "Generating self-signed SSL certificate..."
    mkdir -p $SSL_DIR

    openssl req -x509 -nodes -days $DAYS_VALID \
        -newkey rsa:2048 \
        -keyout $SSL_DIR/server.key \
        -out $SSL_DIR/server.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=$DOMAIN"

    echo "SSL certificate generated at $SSL_DIR"
else
    echo "SSL certificate already exists, skipping generation."
fi

nginx -g 'daemon off;'

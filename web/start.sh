#!/bin/sh

# Use the PORT environment variable if set, otherwise default to 8080
PORT=${PORT:-8080}

# Update nginx configuration with the correct port
sed -i "s/listen 8080;/listen $PORT;/" /etc/nginx/nginx.conf

# Start nginx
nginx -g "daemon off;"

#!/bin/sh

PUBLIC_BASE_PATH=${BASE_URI:-/}

if [ "$PUBLIC_BASE_PATH" != "/" ]; then
    PUBLIC_BASE_PATH="/$(echo "$PUBLIC_BASE_PATH" | sed 's|^/*||; s|/*$||')/"
fi

sed -i "s#/__KOORD_BASEURI__/#${PUBLIC_BASE_PATH}#g" /usr/share/nginx/html/index.html
sed -i "s#/__KOORD_BASEURI__/#${PUBLIC_BASE_PATH}#g" /usr/share/nginx/html/assets/*

export PUBLIC_BASE_PATH=$PUBLIC_BASE_PATH

envsubst "$(printf '${%s} ' $(env | cut -d'=' -f1))" < /etc/nginx/default.conf.template > /etc/nginx/conf.d/default.conf

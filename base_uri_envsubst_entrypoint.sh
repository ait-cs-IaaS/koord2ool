#!/bin/sh

BASE_URI=${BASE_URI:-/}
CONFIG_FILE="/etc/nginx/conf.d/default.conf"

if [ "$BASE_URI" != "/" ]; then
    BASE_URI=$(echo $BASE_URI | sed -e 's/^\/*//' -e 's/\/*$//')
    BASE_URI="/$BASE_URI/"
fi

sed -i "s#/__KOORD_BASEURI__/#${BASE_URI}#g" /usr/share/nginx/html/index.html
sed -i "s#/__KOORD_BASEURI__/#${BASE_URI}#g" /usr/share/nginx/html/assets/*

if [ "$BASE_URI" != "/" ]; then
    LOCATION_BLOCK="\n    location $BASE_URI {\n        alias /usr/share/nginx/html/;\n    }"
    grep -q "location $BASE_URI" $CONFIG_FILE || sed -i "/^}$/i \\$LOCATION_BLOCK" $CONFIG_FILE
fi

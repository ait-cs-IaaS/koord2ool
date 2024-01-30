#!/bin/sh

BASE_URI=${BASE_URI:-/}
CONFIG_FILE="/etc/nginx/conf.d/default.conf"

if [ "$BASE_URI" != "/" ]; then
    LOCATION_BLOCK="\n    location $BASE_URI {\n        alias /usr/share/nginx/html/;\n    }"
    sed -i "/^}$/i \\$LOCATION_BLOCK" $CONFIG_FILE
fi

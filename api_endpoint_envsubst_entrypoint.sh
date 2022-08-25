#!/bin/sh

appjs='/usr/share/nginx/html/js/app.js'

[ -z ${LIMESURVEY_RPC_API} ] && echo "Please set LIMESURVEY_RPC_API environment variable" && exit 1

envsubst '${LIMESURVEY_RPC_API}' < "$appjs" > "${appjs}.tmp" && mv "${appjs}.tmp" "$appjs";

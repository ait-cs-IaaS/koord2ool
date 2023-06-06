#!/bin/sh

envsubst '${BASE_URI}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

FROM node:20 AS builder
ARG VITE_APP_LIMESURVEY_API='${LIMESURVEY_RPC_API}'
ARG BASE_URI=/
ENV NODE_ENV development
ENV NODE_OPTIONS --openssl-legacy-provider
WORKDIR /usr/src/koordtool
COPY . /usr/src/koordtool
RUN npm ci &&\
    npm run build -- --base=${BASE_URI}

FROM nginx:stable-alpine
WORKDIR /usr
ARG BASE_URI=/
COPY nginx_static.conf /etc/nginx/conf.d/default.conf

COPY base_uri_envsubst_entrypoint.sh /docker-entrypoint.d/40-base_uri_envsubst.sh
COPY api_endpoint_envsubst_entrypoint.sh /docker-entrypoint.d/50-api_endpoint_envsubst.sh
COPY --from=builder /usr/src/koordtool/dist /usr/share/nginx/html

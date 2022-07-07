FROM node:18 AS builder
ARG VUE_APP_LIMESURVEY_API=https://lime.cyberrange.rocks/index.php/admin/remotecontrol
ENV NODE_ENV development
ENV NODE_OPTIONS --openssl-legacy-provider
WORKDIR /usr/src/koordtool
COPY . /usr/src/koordtool
RUN npm ci &&\
    npm run build

FROM nginx:stable-alpine
WORKDIR /usr
COPY --from=builder /usr/src/koordtool/dist /usr/share/nginx/html

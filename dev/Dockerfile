FROM node:18
ARG VITE_APP_LIMESURVEY_API=https://lime.cyberrange.rocks/index.php/admin/remotecontrol
ENV NODE_ENV development
ENV NODE_OPTIONS --openssl-legacy-provider
WORKDIR /usr/src/koordtool
COPY . /usr/src/koordtool
RUN npm ci &&\
    npm start

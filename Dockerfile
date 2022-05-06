FROM node:18.1 AS builder
ENV NODE_ENV development
ENV NODE_OPTIONS --openssl-legacy-provider
WORKDIR /usr/src/koordtool
COPY . /usr/src/koordtool
RUN npm ci &&\
    npm run build

FROM nginx:stable-alpine
WORKDIR /usr
COPY --from=builder /usr/src/koordtool/dist /usr/share/nginx/html

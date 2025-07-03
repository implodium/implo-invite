FROM oven/bun:alpine AS build

ARG VITE_WEB_URL
ARG VITE_BACKEND_URL
ENV VITE_WEB_URL=$VITE_WEB_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

WORKDIR /app

COPY package*.json /app

RUN bun install

COPY . /app

RUN bun run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

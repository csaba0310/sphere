FROM node:20-alpine@sha256:f598378b5240225e6beab68fa9f356db1fb8efe55173e6d4d8153113bb8f333c AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
# Build-time public config: Vite inlines VITE_* (and reads BASE_PATH) into the
# static bundle at `vite build`, so these MUST be present at build time — a
# runtime env (ECS task def, docker -e) cannot change an already-built bundle.
# Values are supplied by .github/workflows/docker-build.yml build-args.
ARG VITE_SPHERE_API_URL
ARG VITE_WALLET_API_URL
ARG VITE_REQUIRE_WALLET_API
ARG VITE_AGGREGATOR_API_KEY
ARG VITE_DEV_PORTAL_URL
ARG BASE_PATH=/
ENV VITE_SPHERE_API_URL=$VITE_SPHERE_API_URL \
    VITE_WALLET_API_URL=$VITE_WALLET_API_URL \
    VITE_REQUIRE_WALLET_API=$VITE_REQUIRE_WALLET_API \
    VITE_AGGREGATOR_API_KEY=$VITE_AGGREGATOR_API_KEY \
    VITE_DEV_PORTAL_URL=$VITE_DEV_PORTAL_URL \
    BASE_PATH=$BASE_PATH
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    location = /index.html { \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    } \
    location /assets/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    location / { \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80

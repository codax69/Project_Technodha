# ==============================================================================
# Stage 1: Build React static assets
# ==============================================================================
FROM node:22-alpine AS build

WORKDIR /app

# Cache dependencies using package-lock
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY frontend/ ./

# Pass API base URL during build
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ==============================================================================
# Stage 2: Hardened Alpine Nginx production web server
# ==============================================================================
FROM nginx:alpine

# Remove default static files & copy built bundle + custom config
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

EXPOSE 80

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
# ==============================================================================
# Hardened Alpine Nginx web server (Serving pre-built dist)
# ==============================================================================
FROM nginx:alpine

# Remove default static files & copy pre-built dist bundle + custom config
RUN rm -rf /usr/share/nginx/html/*

COPY frontend/dist/ /usr/share/nginx/html/
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

EXPOSE 80

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
FROM node:24-alpine AS build

WORKDIR /app

COPY frontend/package.json ./

RUN npm install -g npm@11.19.1

RUN npm install --no-audit --no-fund

COPY frontend/ ./

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
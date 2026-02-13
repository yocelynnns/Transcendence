# ----------------------------
# Stage 1: Build React frontend
# ----------------------------
FROM node:24 AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ----------------------------
# Stage 2: Frontend Nginx
# ----------------------------
FROM nginx:alpine

# Remove default Nginx site
RUN rm -rf /usr/share/nginx/html/*
RUN rm /etc/nginx/conf.d/default.conf

# Copy React build
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
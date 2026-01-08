# Frontend Dockerfile
FROM node:24

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev"]

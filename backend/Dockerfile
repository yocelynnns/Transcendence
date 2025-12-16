# Use Node.js 24 LTS
FROM node:24

WORKDIR /usr/src/app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install ALL dependencies (devDependencies are needed for build)
RUN npm ci

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Remove devDependencies after build (optional)
RUN npm prune --production

# Expose server port
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]

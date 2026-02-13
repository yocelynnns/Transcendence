# Use Node.js 24 LTS
FROM node:24

WORKDIR /usr/src/app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript (optional, if you want js output)
RUN npm run build

# Expose server port
EXPOSE 5001

# Start the server with ts-node (needs devDependencies!)
CMD ["npx", "ts-node", "src/index.ts"]

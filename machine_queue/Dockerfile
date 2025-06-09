FROM node:18-alpine

# Install build dependencies and tools
RUN apk add --no-cache python3 make g++ curl wget

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Install curl and wget for health checks
RUN apk add --no-cache curl wget || true

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001
USER nodeuser

# Expose port
EXPOSE 5003

# Health check using wget as fallback
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5003/health || curl -f http://localhost:5003/health || exit 1

# Start the application
CMD ["node", "src/app.js"]
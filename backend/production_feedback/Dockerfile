# Build stage
FROM node:16-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with production flag
RUN npm install --production

# Copy source code
COPY . .

# Production stage
FROM node:16-alpine

WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production

# Copy from build stage
COPY --from=build /app .

# Expose port
EXPOSE 5005

# Start application
CMD ["node", "src/app.js"]
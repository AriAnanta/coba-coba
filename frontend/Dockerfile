# Use Node.js as base image
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --force
RUN npm audit fix --force

# Copy all files
COPY . .

# Create vite config to handle date-fns issue
RUN echo "import { defineConfig } from 'vite'" > vite.config.override.js && \
    echo "import { resolve } from 'path'" >> vite.config.override.js && \
    echo "" >> vite.config.override.js && \
    echo "export default defineConfig({" >> vite.config.override.js && \
    echo "  build: {" >> vite.config.override.js && \
    echo "    rollupOptions: {" >> vite.config.override.js && \
    echo "      external: []," >> vite.config.override.js && \
    echo "    }," >> vite.config.override.js && \
    echo "    commonjsOptions: {" >> vite.config.override.js && \
    echo "      include: [/date-fns/, /node_modules/]," >> vite.config.override.js && \
    echo "      transformMixedEsModules: true" >> vite.config.override.js && \
    echo "    }" >> vite.config.override.js && \
    echo "  }," >> vite.config.override.js && \
    echo "  optimizeDeps: {" >> vite.config.override.js && \
    echo "    include: ['date-fns']" >> vite.config.override.js && \
    echo "  }," >> vite.config.override.js && \
    echo "  resolve: {" >> vite.config.override.js && \
    echo "    alias: {" >> vite.config.override.js && \
    echo "      'date-fns': resolve('./node_modules/date-fns/index.js')" >> vite.config.override.js && \
    echo "    }" >> vite.config.override.js && \
    echo "  }" >> vite.config.override.js && \
    echo "})" >> vite.config.override.js

# Set environment variables for build
ENV NODE_ENV=production

# Build with override config
RUN npx vite build --config vite.config.override.js

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
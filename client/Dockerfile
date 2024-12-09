# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create a .env file with default values at build time
RUN echo "REACT_APP_API_URL=http://api:8000" > .env

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to run the built application
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Create a wrapper script to handle runtime environment variables
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'sed -i "s|http://api:8000|$REACT_APP_API_URL|g" /app/build/static/js/*.js' >> /app/start.sh && \
    echo 'serve -s build -l 3000' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port 3000
EXPOSE 3000

# Start production server using the wrapper script
CMD ["/app/start.sh"] 
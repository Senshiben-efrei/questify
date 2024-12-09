# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to run the built application
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Expose port 3000
EXPOSE 3000

# Start production server
CMD ["serve", "-s", "build", "-l", "3000"] 
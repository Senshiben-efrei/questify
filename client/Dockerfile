# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package.json first
COPY package.json ./

# Install dependencies and create package-lock.json
RUN npm install

# Copy source code
COPY . .

# Development stage
FROM node:20-alpine

WORKDIR /app

# Copy dependencies and source from build stage
COPY --from=build /app ./

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["npm", "start"] 
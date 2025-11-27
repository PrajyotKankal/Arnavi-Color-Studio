# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Install dependencies based on the package and lock files
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Expose the application port
EXPOSE 5000

# Default command (overridden in docker-compose for dev)
CMD ["npm", "start"]

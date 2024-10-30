#!/bin/bash

# Deployment script for production environment

# Exit immediately if a command exits with a non-zero status
set -e

# Load environment variables
source .env

# Update code from repository
echo "Updating code from repository..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm ci --production

# Build the application
echo "Building the application..."
npm run build

# Run database migrations
echo "Running database migrations..."
npx migrate-mongo up

# Stop the current application instances
echo "Stopping current application instances..."
pm2 stop pllay-production

# Start new application instances
echo "Starting new application instances..."
pm2 start ecosystem.config.js --env production

# Run post-deployment tests
echo "Running post-deployment tests..."
npm run test:e2e

echo "Production deployment completed successfully!"
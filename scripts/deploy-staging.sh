#!/bin/bash

# Deployment script for staging environment

# Exit immediately if a command exits with a non-zero status
set -e

# Load environment variables
source .env

# Update code from repository
echo "Updating code from repository..."
git pull origin staging

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building the application..."
npm run build

# Run database migrations
echo "Running database migrations..."
npx migrate-mongo up

# Restart the application
echo "Restarting the application..."
pm2 restart pllay-staging

# Run post-deployment tests
echo "Running post-deployment tests..."
npm run test:e2e

echo "Staging deployment completed successfully!"
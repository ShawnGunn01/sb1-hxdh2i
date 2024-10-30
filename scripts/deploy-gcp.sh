#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Load environment variables
source .env

# Authenticate with Google Cloud
echo $GOOGLE_CLOUD_KEY | base64 --decode > /tmp/google_cloud_key.json
gcloud auth activate-service-account --key-file=/tmp/google_cloud_key.json

# Set the Google Cloud project
gcloud config set project $GOOGLE_CLOUD_PROJECT

# Build the application
npm run build

# Deploy to Google App Engine
gcloud app deploy deploy/gcp/app.yaml --quiet

echo "Deployment to Google Cloud completed successfully!"
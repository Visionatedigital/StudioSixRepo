#!/bin/bash
# Script to update StudioSix repository while preserving environment files

# Display current running processes
echo "Current running processes:"
pm2 list

# Backup environment files
echo "Backing up environment files..."
cp /workspace/StudioSix/.env /workspace/.env.backup
if [ -f "/workspace/StudioSix/.env.local" ]; then
    cp /workspace/StudioSix/.env.local /workspace/.env.local.backup
fi

# Find the app ID for StudioSix
APP_ID=$(pm2 list | grep StudioSix | awk '{print $2}')
if [ -z "$APP_ID" ]; then
    echo "StudioSix app not found in PM2 list. Using name 'StudioSix' instead."
    APP_ID="StudioSix"
fi

# Stop the running application
echo "Stopping application with ID/name: $APP_ID"
pm2 stop $APP_ID

# Clone the new repository in a temporary location
echo "Cloning new repository..."
cd /workspace
git clone https://github.com/Visionatedigital/StudioSix.git StudioSix_new

# Move the backed-up .env files to the new repo
echo "Restoring environment files..."
cp /workspace/.env.backup /workspace/StudioSix_new/.env
if [ -f "/workspace/.env.local.backup" ]; then
    cp /workspace/.env.local.backup /workspace/StudioSix_new/.env.local
fi

# Replace the old directory with the new one
echo "Replacing old repository with new one..."
mv /workspace/StudioSix /workspace/StudioSix_old
mv /workspace/StudioSix_new /workspace/StudioSix

# Install dependencies in the new directory
echo "Installing dependencies..."
cd /workspace/StudioSix
npm install

# Build the application
echo "Building the application..."
npm run build

# Restart the application
echo "Restarting the application..."
pm2 start $APP_ID

# Verify the application is running
echo "Verifying application status:"
pm2 list

# Clean up
echo "Cleaning up..."
rm -rf /workspace/StudioSix_old
rm /workspace/.env.backup
if [ -f "/workspace/.env.local.backup" ]; then
    rm /workspace/.env.local.backup
fi

echo "Update complete!" 
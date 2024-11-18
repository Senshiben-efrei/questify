#!/bin/bash

# Get the local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0)
else
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

# Update the .env file
sed -i.bak "s#API_URL=.*#API_URL=http://${LOCAL_IP}:8000#" .env

echo "Updated API_URL to http://${LOCAL_IP}:8000 in .env file" 
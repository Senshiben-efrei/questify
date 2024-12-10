#!/bin/bash

if [ "$BUILD_MODE" = "production" ]; then
  echo "Dockerfile"
else
  echo "Dockerfile.dev"
fi 
#!/bin/sh
#This script downloads WASM classifier using Edge Impulse API
# API Key and Project ID are defined as environment variables in BalenaCloud


curl --request GET \
  --url "https://studio.edgeimpulse.com/v1/api/$EI_PROJECT_ID/deployment/download?type=wasm" \
  --header "accept: application/zip" \
  --header "x-api-key: $EI_API_KEY" --output wasm.zip

unzip -o wasm.zip && rm wasm.zip

echo "WASM downloaded..."

# default WASM classifier will be loaded if curl request fails
exit 0
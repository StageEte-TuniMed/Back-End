#!/bin/bash

# SonarQube Analysis Script with URL Discovery
set -e

echo "🔍 Discovering SonarQube URL..."

# Default URLs to try
SONAR_URLS=(
    "http://172.17.0.1:9000"
    "http://host.docker.internal:9000" 
    "http://localhost:9000"
    "http://sonarqube:9000"
)

WORKING_URL=""

# Test each URL
for url in "${SONAR_URLS[@]}"; do
    echo "Testing: $url"
    if curl -s --connect-timeout 5 --max-time 10 "$url" > /dev/null 2>&1; then
        echo "✅ $url is accessible"
        WORKING_URL=$url
        break
    else
        echo "❌ $url is not accessible"
    fi
done

if [ -z "$WORKING_URL" ]; then
    echo "🚨 No SonarQube server found. Please ensure SonarQube is running."
    exit 1
fi

echo "🎯 Using SonarQube URL: $WORKING_URL"

# Run tests with coverage first
echo "📊 Generating test coverage..."
npm run test:coverage

# Run SonarQube analysis
echo "🔎 Running SonarQube analysis..."
sonar-scanner \
  -Dsonar.host.url="$WORKING_URL" \
  -Dsonar.projectKey=tunimed-backend \
  -Dsonar.projectName="TuniMed Backend API" \
  -Dsonar.projectVersion=1.0.0 \
  -Dsonar.sources=src \
  -Dsonar.tests=src/test \
  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
  -Dsonar.exclusions="**/node_modules/**,**/coverage/**,**/dist/**,**/build/**,**/*.test.js,**/*.spec.js,**/test/**"

echo "✅ SonarQube analysis completed successfully!"

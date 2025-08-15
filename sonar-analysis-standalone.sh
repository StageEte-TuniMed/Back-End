#!/bin/bash
# SonarQube Analysis with Dynamic URL Discovery
# This script ensures the correct SonarQube URL is used

set -e

echo "🚀 Starting TuniMed Backend SonarQube Analysis..."
echo "📅 $(date)"

# Function to test URL
test_url() {
    local url=$1
    echo "Testing: $url"
    if curl -s --connect-timeout 5 --max-time 10 "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Discover working SonarQube URL
echo "🔍 Discovering SonarQube URL..."

SONAR_URLS=(
    "http://172.17.0.1:9000"
    "http://host.docker.internal:9000"
    "http://localhost:9000"
    "http://sonarqube:9000"
)

WORKING_URL=""

for url in "${SONAR_URLS[@]}"; do
    if test_url "$url"; then
        echo "✅ $url is accessible"
        WORKING_URL=$url
        break
    else
        echo "❌ $url is not accessible"
    fi
done

if [ -z "$WORKING_URL" ]; then
    echo "🚨 No SonarQube server found. Using fallback URL."
    WORKING_URL="http://localhost:9000"
fi

echo "🎯 Selected SonarQube URL: $WORKING_URL"

# Generate test coverage
echo "📊 Generating test coverage..."
if npm run test:coverage; then
    echo "✅ Test coverage generated successfully"
else
    echo "⚠️ Test coverage generation failed, continuing without coverage..."
fi

# Run SonarQube analysis
echo "🔍 Running SonarQube analysis..."
echo "📋 Analysis Configuration:"
echo "   URL: $WORKING_URL"
echo "   Project: tunimed-backend"
echo "   Sources: src/"
echo "   Tests: src/test/"

sonar-scanner \
    -Dsonar.host.url="$WORKING_URL" \
    -Dsonar.projectKey=tunimed-backend \
    -Dsonar.projectName="TuniMed Backend API" \
    -Dsonar.projectVersion=1.0.0 \
    -Dsonar.sources=src \
    -Dsonar.tests=src/test \
    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
    -Dsonar.exclusions="**/node_modules/**,**/coverage/**,**/dist/**,**/build/**,**/*.test.js,**/*.spec.js,**/test/**" \
    -Dsonar.test.inclusions="**/*.test.js,**/*.spec.js" \
    -Dsonar.language=js \
    -Dsonar.sourceEncoding=UTF-8 \
    -Dsonar.qualitygate.wait=false

echo "✅ SonarQube analysis completed successfully!"
echo "🔗 Check your results at: $WORKING_URL/dashboard?id=tunimed-backend"

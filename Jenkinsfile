pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
    }
    
    stages {   agent any
    
    tools {
        nodejs 'NodeJS'
    }
    
    environment {
        // Add your SonarQube token here (replace with your actual token)
        SONAR_TOKEN = 'squ_3fcb4a335911591f2d3853fae092bf9266dcbc3d'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install --legacy-peer-deps'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                sh 'npm run test:coverage || true'
                script {
                    // Debug: Show environment variables
                    echo "🔍 Debugging environment variables..."
                    sh 'echo "SONAR_TOKEN length: ${#SONAR_TOKEN}"'
                    sh 'env | grep -i sonar || echo "No SONAR variables found"'
                    
                    // Try different SonarQube URLs
                    def sonarUrls = [
                        'http://172.17.0.1:9000',      // Docker bridge IP (works from container)
                        'http://host.docker.internal:9000', // Docker Desktop
                        'http://localhost:9000'         // Local (works from host)
                    ]
                    
                    def workingUrl = null
                    for (url in sonarUrls) {
                        def result = sh(returnStatus: true, script: "curl -s --connect-timeout 5 ${url} > /dev/null")
                        if (result == 0) {
                            workingUrl = url
                            echo "✅ Found working SonarQube URL: ${url}"
                            break
                        } else {
                            echo "❌ ${url} not accessible"
                        }
                    }
                    
                    if (workingUrl) {
                        def token = env.SONAR_TOKEN ?: ''
                        if (token) {
                            echo "🔑 Using SONAR_TOKEN for authentication"
                            sh "npx sonar-scanner -Dsonar.host.url=${workingUrl} -Dsonar.token=${token}"
                        } else {
                            echo "⚠️ No SONAR_TOKEN found, running without authentication"
                            sh "npx sonar-scanner -Dsonar.host.url=${workingUrl}"
                        }
                    } else {
                        echo "❌ No SonarQube server accessible. Trying localhost:9000 anyway..."
                        def token = env.SONAR_TOKEN ?: ''
                        if (token) {
                            sh "npx sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=${token}"
                        } else {
                            sh "npx sonar-scanner -Dsonar.host.url=http://localhost:9000"
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t tunimed-backend .'
            }
        }
    }
}

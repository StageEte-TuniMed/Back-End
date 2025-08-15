pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
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
                    def sonarUrls = ['http://172.17.0.1:9000', 'http://localhost:9000']
                    def workingUrl = null
                    
                    // Find working SonarQube URL
                    for (url in sonarUrls) {
                        def result = sh(returnStatus: true, script: "curl -s --connect-timeout 5 ${url} > /dev/null")
                        if (result == 0) {
                            workingUrl = url
                            echo "✅ Using SonarQube at: ${url}"
                            break
                        }
                    }
                    
                    if (!workingUrl) {
                        workingUrl = 'http://localhost:9000'
                        echo "⚠️ SonarQube not accessible, trying localhost anyway..."
                    }
                    
                    // Try to use Jenkins credentials, fallback to environment variable
                    try {
                        withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                            sh "npx sonar-scanner -Dsonar.host.url=${workingUrl} -Dsonar.token=${SONAR_TOKEN}"
                        }
                    } catch (Exception e) {
                        echo "⚠️ Jenkins credential 'sonarqube-token' not found. Please create it in Jenkins."
                        echo "For now, running without authentication (will likely fail):"
                        sh "npx sonar-scanner -Dsonar.host.url=${workingUrl}"
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    // Check if Docker is available
                    def dockerAvailable = sh(returnStatus: true, script: 'which docker > /dev/null 2>&1')
                    if (dockerAvailable == 0) {
                        echo "🐳 Building Docker image..."
                        sh 'docker build -t tunimed-backend .'
                    } else {
                        echo "⚠️ Docker not available in Jenkins environment, skipping Docker build"
                    }
                }
            }
        }
    }
}

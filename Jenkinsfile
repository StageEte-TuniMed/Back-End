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
                
                // Use Jenkins credentials for SonarQube token
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                    script {
                        def sonarUrls = ['http://172.17.0.1:9000', 'http://localhost:9000']
                        
                        for (url in sonarUrls) {
                            def result = sh(returnStatus: true, script: "curl -s --connect-timeout 5 ${url} > /dev/null")
                            if (result == 0) {
                                echo "✅ Using SonarQube at: ${url}"
                                sh "npx sonar-scanner -Dsonar.host.url=${url} -Dsonar.token=${SONAR_TOKEN}"
                                return
                            }
                        }
                        
                        echo "⚠️ SonarQube not accessible, trying localhost anyway..."
                        sh "npx sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=${SONAR_TOKEN}"
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

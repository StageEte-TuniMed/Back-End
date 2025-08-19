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
                script {
                    // Test connectivity first
                    sh 'curl -I http://172.17.0.1:9000 || echo "172.17.0.1 failed"'
                    sh 'curl -I http://host.docker.internal:9000 || echo "host.docker.internal failed"'
                }
                withSonarQubeEnv('scanner') {
                    sh 'npx sonar-scanner'
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

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
                withSonarQubeEnv('scanner') {
                    sh 'npx sonar-scanner'
                }
            }
        }
        
        stage('Building images (node and mongo)') {
            steps {
                script {
                    // Check if Docker is available
                    def dockerAvailable = sh(returnStatus: true, script: 'which docker > /dev/null 2>&1')
                    if (dockerAvailable == 0) {
                        echo "🐳 Building Docker images with docker-compose..."
                        sh 'docker-compose build'
                    } else {
                        echo "⚠️ Docker not available in Jenkins environment"
                        echo "To enable Docker builds, you need to:"
                        echo "1. Install Docker in Jenkins container, OR"
                        echo "2. Mount Docker socket, OR"
                        echo "3. Use Jenkins with Docker support"
                        echo "Skipping Docker build for now..."
                    }
                }
            }
        }
    }
}

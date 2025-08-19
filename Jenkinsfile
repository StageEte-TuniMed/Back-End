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

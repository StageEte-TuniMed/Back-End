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
                sh 'npx sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=${SONAR_TOKEN}'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t tunimed-backend .'
            }
        }
    }
}

pipeline {
    agent any
    
    // Force pipeline refresh - Updated 2025-08-15 for SonarQube URL fix
    
    tools {
        nodejs 'NodeJS'
        // Add SonarQube Scanner tool if configured in Jenkins
        // sonarQubeScanner 'SonarQube Scanner'
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
                    echo "🔍 Starting SonarQube Analysis with Standalone Script..."
                    
                    // Make the script executable and run it
                    sh '''
                        chmod +x sonar-analysis-standalone.sh
                        ./sonar-analysis-standalone.sh
                    '''
                }
            }
        }

        stage('Quality Gate') {
            when { expression { return env.SKIP_QUALITY_GATE != 'true' } }
            steps {
                script {
                    // Wait for SonarQube to compute the Quality Gate (requires SonarQube Scanner for Jenkins plugin)
                    timeout(time: 3, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
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

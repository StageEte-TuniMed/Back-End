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
                    // Ensure we can reach the host machine's SonarQube from inside the Jenkins agent container.
                    // Override the host URL explicitly in case the Jenkins global config still points to localhost.
            withSonarQubeEnv('sonarqube') { // Using confirmed configured server name
                        sh "curl -s -o /dev/null -w '%{http_code}\n' http://host.docker.internal:9000 || true"
                        sh 'npm run sonar -- -Dsonar.host.url=http://host.docker.internal:9000'
                    }
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

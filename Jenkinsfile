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
                    // Try different SonarQube URLs
                    def sonarUrls = [
                        'http://localhost:9000',
                        'http://172.17.0.1:9000',
                        'http://host.docker.internal:9000'
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
                        sh "npx sonar-scanner -Dsonar.host.url=${workingUrl} -Dsonar.token=${SONAR_TOKEN}"
                    } else {
                        echo "❌ No SonarQube server accessible. Trying localhost:9000 anyway..."
                        sh "npx sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=${SONAR_TOKEN}"
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

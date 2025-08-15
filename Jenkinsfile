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
                    // Try multiple SonarQube endpoints and find the working one
                    def sonarUrl = 'http://localhost:9000'
                    def workingUrl = null
                    
                    // Check if we're in a container and try different URLs
                    def isContainer = sh(returnStatus: true, script: 'test -f /.dockerenv') == 0
                    if (isContainer) {
                        echo "Running in container, trying different SonarQube URLs..."
                        def candidates = ['http://172.17.0.1:9000', 'http://host.docker.internal:9000', 'http://sonarqube:9000', 'http://localhost:9000']
                        for (url in candidates) {
                            def code = sh(returnStdout: true, script: "curl -s -o /dev/null -w '%{http_code}' ${url} || echo '000'").trim()
                            echo "Testing ${url}: HTTP ${code}"
                            if (code == '200' || code == '302') {
                                workingUrl = url
                                echo "✓ Found working SonarQube URL: ${url}"
                                break
                            }
                        }
                        
                        if (workingUrl) {
                            sonarUrl = workingUrl
                        } else {
                            echo "⚠ No working SonarQube URL found, using default: ${sonarUrl}"
                        }
                    }
                    
                    echo "Using SonarQube URL: ${sonarUrl}"
                    
                    // Generate coverage before analysis
                    sh 'npm run test:coverage'
                    
                    withSonarQubeEnv('sonarqube') {
                        sh "npm run sonar -- -Dsonar.host.url=${sonarUrl} -Dsonar.login=${SONAR_AUTH_TOKEN}"
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

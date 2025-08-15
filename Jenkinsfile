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
                        def candidates = [
                            'http://host.docker.internal:9000',
                            'http://172.17.0.1:9000', // common docker bridge gateway
                            'http://sonarqube:9000',   // if running via docker-compose service name
                            'http://localhost:9000'
                        ]
                        def good = null
                        for (c in candidates) {
                            echo "Probing SonarQube at ${c}"
                            def rc = sh(returnStatus: true, script: "curl -s -o /dev/null -w '%{http_code}' ${c}")
                            if (rc == 0) {
                                // curl -w outputs code to stdout, returnStatus only tells command success; fetch actual code
                                def code = sh(returnStdout: true, script: "curl -s -o /dev/null -w '%{http_code}' ${c}").trim()
                                echo "HTTP ${code} from ${c}"
                                if (code == '200' || code == '302') { good = c; break }
                            } else {
                                echo "Host unreachable: ${c}"
                            }
                        }
                        if (!good) {
                            error "Could not reach any SonarQube endpoint (${candidates.join(', ')})"
                        }
                        echo "Using SonarQube URL: ${good}"
                        sh "npm run sonar -- -Dsonar.host.url=${good}"
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

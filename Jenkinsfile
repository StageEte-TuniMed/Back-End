pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
    }
    
    environment {
        registryCredentials = "nexus"
        registry = "172.17.0.1:8083"
        KUBECONFIG_CREDENTIAL_ID = "kubeconfig"
        NVD_API_KEY = "f605aff2-4fc5-4d35-beb5-15a4be5a8438"
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

        stage('Dependency Scan (OWASP Dependency-Check)') {
            steps {
                sh '''
                    mkdir -p reports
                    docker run --rm -v "${WORKSPACE}":/src -v "${WORKSPACE}"/reports:/reports \
                        -e NVD_API_KEY="${NVD_API_KEY}" \
                        owasp/dependency-check:latest \
                        --scan /src --format "HTML" --out /reports \
                        --nvdApiKey "${NVD_API_KEY}"
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/dependency-check-report.html', allowEmptyArchive: true
                }
            }
        }

        stage('Security Test (OWASP ZAP)') {
            steps {
                sh '''
                    mkdir -p zap_reports
                    docker run --rm -v "${WORKSPACE}"/zap_reports:/zap/wrk/ \
                        owasp/zap2docker-stable:latest \
                        zap-baseline.py -t http://localhost:3000 -r zap_report.html || true
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'zap_reports/zap_report.html', allowEmptyArchive: true
                }
            }
        }

        stage('Building images (node and mongo)') {
            steps {
                script {
                    sh('docker-compose build')
                }
            }
        }
        
        // Uploading Docker images into Nexus Registry
        stage('Deploy to Nexus') {
            steps {
                script {
                    docker.withRegistry("http://"+registry, registryCredentials) {
                        sh('docker push $registry/tunimed-backend:1.0')
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    withCredentials([file(credentialsId: env.KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG')]) {
                        // Verify kubectl access
                        sh 'kubectl version --client'
                        sh 'kubectl cluster-info'
                        
                        // Create namespace if it doesn't exist
                        sh 'kubectl apply -f k8s/namespace.yaml'
                        
                        // Deploy MongoDB first
                        sh 'kubectl apply -f k8s/mongodb.yaml'
                        
                        // Wait for MongoDB to be ready (with timeout)
                        sh 'kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n tunimed || true'
                        
                        // Deploy the backend application
                        sh 'kubectl apply -f k8s/deployment.yaml'
                        
                        // Delete old failing pods to force restart with new config
                        sh 'kubectl delete pods -l app=tunimed-backend -n tunimed --grace-period=0 --force || true'
                        
                        // Wait for deployment to be ready
                        sh 'kubectl wait --for=condition=available --timeout=30s deployment/tunimed-backend -n tunimed || true'
                        
                        // Apply ingress configuration
                        sh 'kubectl apply -f k8s/ingress.yaml'
                        
                        // Show deployment status
                        sh 'kubectl get pods -o wide -n tunimed'
                        sh 'kubectl get services -n tunimed'
                        sh 'kubectl get ingress -n tunimed'
                        
                        // Clean up temporary file
                        sh 'rm -f /tmp/kubeconfig'
                    }
                }
            }
        }
        
        stage('Verify K8s Deployment') {
            steps {
                script {
                    withCredentials([file(credentialsId: env.KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG')]) {
                        // Check pod status
                        sh 'kubectl get pods -l app=tunimed-backend -o wide -n tunimed'
                        sh 'kubectl get pods -l app=mongodb -o wide -n tunimed'
                        
                        // Get service details
                        sh 'kubectl describe svc tunimed-backend-service -n tunimed'
                        
                        // Show logs if there are issues
                        sh 'kubectl logs -l app=tunimed-backend --tail=20 -n tunimed || true'
                    }
                }
            }
        }
        
        stage('Run application') {
            steps {
                script {
                    docker.withRegistry("http://"+registry, registryCredentials) {
                        sh('docker pull $registry/tunimed-backend:1.0')
                        sh('docker-compose up -d')
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed'
        }
        failure {
            script {
                // Rollback on failure
                withCredentials([file(credentialsId: env.KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG')]) {
                    sh 'kubectl rollout undo deployment/tunimed-backend || true'
                }
            }
        }
    }
}
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
    }
    
    environment {
        registryCredentials = "nexus"
        registry = "172.17.0.1:8083"
        KUBECONFIG_CREDENTIAL_ID = "kubeconfig"
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
                        
                        // Force update deployment with environment variables
                        sh '''
                            kubectl patch deployment tunimed-backend -n tunimed -p '{
                                "spec": {
                                    "template": {
                                        "spec": {
                                            "containers": [{
                                                "name": "tunimed-backend",
                                                "env": [
                                                    {"name": "NODE_ENV", "value": "production"},
                                                    {"name": "PORT", "value": "3000"},
                                                    {"name": "MONGODB_URI", "value": "mongodb://admin:password123@mongodb-service.tunimed:27017/tunimed?authSource=admin"}
                                                ]
                                            }]
                                        }
                                    }
                                }
                            }'
                        '''
                        
                        // Wait for rollout to complete (or timeout)
                        sh 'kubectl rollout status deployment/tunimed-backend -n tunimed --timeout=60s || true'
                        
                        // Show current pod status
                        sh 'kubectl get pods -l app=tunimed-backend -n tunimed'
                        
                        // Show recent logs to debug
                        sh 'kubectl logs -l app=tunimed-backend -n tunimed --tail=10 || true'
                        
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
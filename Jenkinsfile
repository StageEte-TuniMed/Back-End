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
                    withCredentials([string(credentialsId: env.KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG_CONTENT')]) {
                        // Create temporary kubeconfig file
                        sh 'echo "$KUBECONFIG_CONTENT" > /tmp/kubeconfig'
                        sh 'export KUBECONFIG=/tmp/kubeconfig'
                        
                        // Verify kubectl access
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl version --client'
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl cluster-info'
                        
                        // Create namespace if it doesn't exist
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl apply -f k8s/namespace.yaml'
                        
                        // Deploy MongoDB first
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl apply -f k8s/mongodb.yaml'
                        
                        // Wait for MongoDB to be ready (with timeout)
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl wait --for=condition=available --timeout=300s deployment/mongodb || true'
                        
                        // Deploy the backend application
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl apply -f k8s/deployment.yaml'
                        
                        // Wait for deployment to be ready
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl wait --for=condition=available --timeout=300s deployment/tunimed-backend || true'
                        
                        // Apply ingress configuration
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl apply -f k8s/ingress.yaml'
                        
                        // Show deployment status
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl get pods -o wide'
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl get services'
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl get ingress'
                        
                        // Clean up temporary file
                        sh 'rm -f /tmp/kubeconfig'
                    }
                }
            }
        }
        
        stage('Verify K8s Deployment') {
            steps {
                script {
                    withCredentials([string(credentialsId: env.KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG_CONTENT')]) {
                        // Create temporary kubeconfig file
                        sh 'echo "$KUBECONFIG_CONTENT" > /tmp/kubeconfig'
                        
                        // Check pod status
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl get pods -l app=tunimed-backend -o wide'
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl get pods -l app=mongodb -o wide'
                        
                        // Get service details
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl describe svc tunimed-backend-service'
                        
                        // Show logs if there are issues
                        sh 'KUBECONFIG=/tmp/kubeconfig kubectl logs -l app=tunimed-backend --tail=20 || true'
                        
                        // Clean up temporary file
                        sh 'rm -f /tmp/kubeconfig'
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
                withCredentials([string(credentialsId: env.KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG_CONTENT')]) {
                    sh 'echo "$KUBECONFIG_CONTENT" > /tmp/kubeconfig'
                    sh 'KUBECONFIG=/tmp/kubeconfig kubectl rollout undo deployment/tunimed-backend || true'
                    sh 'rm -f /tmp/kubeconfig'
                }
            }
        }
    }
}
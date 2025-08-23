pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
    }
    
    environment {
        registryCredentials = "nexus"
        registry = "172.17.0.1:8083"
        KUBECONFIG_CREDENTIAL_ID = "kubeconfig"
        IMAGE_NAME = "tunimed-backend"
        IMAGE_TAG = "1.0"
        FULL_IMAGE_NAME = "${registry}/${IMAGE_NAME}:${IMAGE_TAG}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-repo/tunimed-backend.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
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
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Building images (node and mongo)') {
            steps {
                script {
                    sh "docker build -t ${FULL_IMAGE_NAME} ."
                    echo "Image built: ${FULL_IMAGE_NAME}"
                }
            }
        }
        
        stage('Deploy to Nexus') {
            steps {
                script {
                    withEnv(["DOCKER_REGISTRY=${registry}"]) {
                        withDockerRegistry([credentialsId: registryCredentials, url: "http://${registry}"]) {
                            sh "docker push ${FULL_IMAGE_NAME}"
                            echo "Image pushed to Nexus: ${FULL_IMAGE_NAME}"
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    withCredentials([file(credentialsId: env.KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG')]) {
                        // Test cluster connectivity
                        sh 'kubectl --kubeconfig $KUBECONFIG version --client'
                        sh 'kubectl --kubeconfig $KUBECONFIG get nodes'
                        
                        // Create namespace and registry secret
                        sh '''
                            kubectl --kubeconfig $KUBECONFIG create namespace tunimed 2>/dev/null || true
                            kubectl --kubeconfig $KUBECONFIG delete secret nexus-registry-secret -n tunimed 2>/dev/null || true
                            kubectl --kubeconfig $KUBECONFIG create secret docker-registry nexus-registry-secret \
                                --docker-server=172.17.0.1:8083 \
                                --docker-username=admin \
                                --docker-password='nassim 2022' \
                                -n tunimed
                        '''
                        
                        // Load image into Minikube (bypass registry pull issues)
                        sh "minikube image load ${FULL_IMAGE_NAME}"
                        
                        // Deploy MongoDB first
                        sh '''
                            kubectl --kubeconfig $KUBECONFIG apply -f k8s/namespace.yaml
                            kubectl --kubeconfig $KUBECONFIG apply -f k8s/mongodb.yaml
                            kubectl --kubeconfig $KUBECONFIG -n tunimed rollout status deployment/mongodb --timeout=120s || true
                        '''
                        
                        // Deploy backend application
                        sh '''
                            kubectl --kubeconfig $KUBECONFIG apply -f k8s/deployment.yaml
                            kubectl --kubeconfig $KUBECONFIG -n tunimed rollout status deployment/tunimed-backend --timeout=180s || true
                        '''
                        
                        // Show deployment status
                        sh 'kubectl --kubeconfig $KUBECONFIG -n tunimed get pods,svc -o wide'
                    }
                }
            }
        }
        
        stage('Verify K8s Deployment') {
            steps {
                script {
                    withCredentials([file(credentialsId: env.KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG')]) {
                        // Wait for pods to be ready
                        sh '''
                            echo "Waiting for pods to be ready..."
                            kubectl --kubeconfig $KUBECONFIG -n tunimed wait --for=condition=ready pod -l app=mongodb --timeout=120s || true
                            kubectl --kubeconfig $KUBECONFIG -n tunimed wait --for=condition=ready pod -l app=tunimed-backend --timeout=180s || true
                        '''
                        
                        // Get pod status and logs
                        sh '''
                            echo "=== Pod Status ==="
                            kubectl --kubeconfig $KUBECONFIG -n tunimed get pods
                            
                            echo "=== Service Status ==="
                            kubectl --kubeconfig $KUBECONFIG -n tunimed get svc
                            
                            echo "=== Backend Pod Logs ==="
                            kubectl --kubeconfig $KUBECONFIG -n tunimed logs -l app=tunimed-backend --tail=50 || true
                        '''
                        
                        // Test health endpoint
                        sh '''
                            echo "=== Testing Health Endpoint ==="
                            kubectl --kubeconfig $KUBECONFIG -n tunimed port-forward svc/tunimed-backend-service 8080:80 &
                            FORWARD_PID=$!
                            sleep 5
                            curl -f http://localhost:8080/health || echo "Health check failed"
                            kill $FORWARD_PID || true
                        '''
                    }
                }
            }
        }
        
        stage('Run application') {
            steps {
                script {
                    sh '''
                        echo "Starting application with docker-compose..."
                        docker-compose down || true
                        docker-compose up -d
                        sleep 10
                        docker-compose ps
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed'
            script {
                withCredentials([file(credentialsId: env.KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG')]) {
                    // Clean up port-forwards
                    sh 'pkill -f "kubectl.*port-forward" || true'
                    
                    // Show final status
                    sh '''
                        echo "=== Final Cluster Status ==="
                        kubectl --kubeconfig $KUBECONFIG -n tunimed get all || true
                    '''
                }
            }
        }
        failure {
            echo 'Pipeline failed'
            script {
                withCredentials([file(credentialsId: env.KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG')]) {
                    // Rollback deployment on failure
                    sh '''
                        echo "Rolling back deployment..."
                        kubectl --kubeconfig $KUBECONFIG -n tunimed rollout undo deployment/tunimed-backend || true
                        kubectl --kubeconfig $KUBECONFIG -n tunimed get pods || true
                    '''
                }
            }
        }
    }
}
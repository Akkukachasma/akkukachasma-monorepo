pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'docker build -t app-image:${BUILD_NUMBER} .'
                echo 'remove running app container'
                sh 'docker stop app-container || true'
                sh 'docker rm app-container || true'
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker run -d --name app-container -p 3000:3000 app-image:${BUILD_NUMBER}'
            }
        }
        stage('Cleanup') {
            steps {
                echo 'removing unused artifacts'
                sh 'docker system prune -af'
            }
        }
    }
}

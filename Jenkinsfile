pipeline {
    agent any

    tools {
        // El “Name” que diste en Jenkins Admin → Tools → NodeJS
        nodejs 'NodeJS_24'
    }

    stages {
        stage('Clone') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    git branch: 'main',
                        credentialsId: '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',
                        url: 'https://github.com/Samuel-910/pruebas-front.git'
                }
            }
        }

        // A partir de aquí, entramos en capachica-app
        stage('Install dependencies') {
            steps {
                dir('capachica-app') {
                    sh 'npm install'
                }
            }
        }




        stage('Build') {
            steps {
                dir('capachica-app') {
                    sh 'npm run build -- --prod'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                dir('capachica-app') {
                    withSonarQubeEnv('sonarqube') {
                        sh 'sonar-scanner'
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }

    post {
        success { echo '✅ ¡Todo verde!' }
        failure { echo '🚨 Algo falló, échale un ojo.' }
        always  { echo '🔚 Pipeline finalizado.' }
    }
}

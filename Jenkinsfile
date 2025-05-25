pipeline {
    agent any

    tools {
        // Nombre de la instalación de NodeJS configurada en Jenkins
        nodejs "NODEJS"
    }

    environment {
        // Si tienes un token de SonarQube guardado en Jenkins Credentials
        SONAR_TOKEN = credentials('sonar-token-id')
        // Carpeta de tu app Angular (ajusta si tu proyecto no está en `frontend`)
        APP_DIR = '.'
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

        stage('Install dependencies') {
            steps {
                dir("${APP_DIR}") {
                    timeout(time: 5, unit: 'MINUTES') {
                        sh 'npm ci'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                dir("${APP_DIR}") {
                    timeout(time: 8, unit: 'MINUTES') {
                        sh 'npm run build -- --configuration=production'
                    }
                }
            }
        }

        stage('Test & Lint') {
            steps {
                dir("${APP_DIR}") {
                    timeout(time: 10, unit: 'MINUTES') {
                        // Ejecuta tests en modo headless y lint
                        sh 'npm run test -- --watch=false --browsers=ChromeHeadless'
                        sh 'npm run lint'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            environment {
                SONAR_HOST_URL = 'https://tu-sonarqube.example.com'
            }
            steps {
                dir("${APP_DIR}") {
                    timeout(time: 4, unit: 'MINUTES') {
                        withSonarQubeEnv('SonarQube') {
                            // Asume que en package.json tienes:
                            // "scripts": { "sonar": "sonar-scanner" }
                            sh 'npm run sonar'
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                sleep 10
                timeout(time: 4, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy') {
            steps {
                dir("${APP_DIR}") {
                    timeout(time: 5, unit: 'MINUTES') {
                        // Ajusta según tu estrategia de despliegue
                        // Aquí simplemente listamos el contenido de dist/
                        sh 'echo "Contenido de dist/:" && ls -la dist/'
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        failure {
            mail to: 'equipo@tudominio.com',
                 subject: "Build falló: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "Revisa la consola: ${env.BUILD_URL}"
        }
    }
}

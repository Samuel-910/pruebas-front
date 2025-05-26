pipeline {
    agent any

    tools {
        // El “Name” que diste en Jenkins Admin → Tools → NodeJS
        nodejs 'NodeJS_24'
        // El “Name” que diste en Jenkins Admin → Global Tool Config → SonarScanner installations
        sonarScanner 'sonarqube'
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
                sh 'npm ci'
            }
        }

        stage('Unit tests') {
            steps {
                // Ajusta el comando a tu suite de tests Angular
                sh 'npm run test -- --watch=false --browsers=ChromeHeadless'
            }
            post {
                always {
                    // Publica resultados de Jasmine/Karma
                    junit '**/test-results/*.xml'
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build -- --prod'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                // 'MySonarQubeServer' es el nombre que diste en Manage Jenkins → Configure System → SonarQube servers
                withSonarQubeEnv('MySonarQubeServer') {
                    // Lanza el scanner que instalaste con el label 'sonarqube'
                    sh 'sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                // Espera el resultado de SonarQube y aborta si falla el Quality Gate
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build y análisis completados correctamente.'
        }
        failure {
            echo '❌ Falló el pipeline — revisa consola y SonarQube.'
        }
        always {
            echo '🔚 Pipeline finalizado.'
        }
    }
}

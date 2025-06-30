pipeline {
    agent any

    tools {
        nodejs 'NodeJS_24'
    }

    stages {
        stage('Clone') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    git branch: 'main',
                        credentialsId: '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',
                        url: 'https://github.com/Samuel-910/pruebas.git'
                }
            }
        }

        // A partir de aquí, entramos en capachica-app
        stage('Install dependencies') {
            steps {
                dir('turismo-frontend') {
                    sh 'npm install'
                }
            }
        }

		stage('Unit tests + Coverage') {
		  steps {
			dir('turismo-frontend') {
			      timeout(time: 20, unit: 'MINUTES') {
			  sh 'npm run test -- --watch=false --browsers=ChromeHeadless --code-coverage'
			  }
			}
		  }
		}


stage('Build') {
    steps {
        dir('turismo-frontend') {
            timeout(time: 10, unit: 'MINUTES') {  // Establece un límite de 30 minutos
                sh 'npm run build'
            }
        }
    }
}


stage('SonarQube Analysis') {
  steps {
    dir('turismo-frontend') {
      timeout(time: 20, unit: 'MINUTES') {  // Establece un límite de 20 minutos
        withSonarQubeEnv('sonarqube') {
          sh 'npx sonar-scanner'
        }
      }
    }
  }
}


        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
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

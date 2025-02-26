import { envEnvironment } from './envVariables'
import { EnvironemntType } from './typesConfig'

export const dynamoDbUrl = 'http://localhost:8000' // TODO: provide from .env

export const currentEnvironemnt = (): EnvironemntType => {
  switch (envEnvironment()) {
    case 'development':
      return 'development'
    case 'test':
      return 'test'
    case 'staging':
      return 'staging'
    case 'production':
      return 'production'
    default:
      throw new Error('envEnvironment() process.env.ENVIRONMENT is empty')
  }
}

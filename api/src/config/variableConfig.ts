import { InternalServerError } from '../utils/errors'
import { envEnvironment } from './envVariables'
import { EnvironemntType } from './typesConfig'

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
      console.error('envEnvironment() process.env.ENVIRONMENT is empty')
      return 'development'
  }
}

import { EnvironemntType } from './typesConfig'

export const dynamoDbUrl = 'http://localhost:8000' // TODO: provide from .env

export const currentEnvironemnt = (): EnvironemntType => {
  const environemnt = process.env.ENVIRONMENT as string

  switch (environemnt) {
    case 'development':
      return 'development'
    case 'test':
      return 'test'
    case 'staging':
      return 'staging'
    case 'production':
      return 'production'
    default:
      return 'development'
  }
}

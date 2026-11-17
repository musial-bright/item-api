import { IamConfigType } from './typesConfig'

export const envApiKeyAuth = () => process.env.API_KEY_AUTH

export const envEnvironment = () => process.env.ENVIRONMENT as string

export const envDynamoDbEndpoint = () => process.env.DYNAMO_DB_ENDPOINT

export const envDynamoDbRegion = () => 'eu-central-1'

export const envS3Region = () => 'eu-central-1'

export const envS3FileBucket = () => 's3bucket'

export const envIamConfig = (): IamConfigType => {
  const jrIamConfig = process.env.JR_IAM_CONFIG

  const config: IamConfigType = {
    teamIDs: {
      userManager: undefined,
      aiTeam: undefined,
    },
    userIds: {
      apiKeyUser: undefined,
    },
  }

  if (!jrIamConfig || jrIamConfig === '') {
    console.error('JR_IAM_CONFIG environment variable is not set')
    return config
  }

  try {
    const parsedConfig = JSON.parse(jrIamConfig) as IamConfigType
    config.teamIDs.userManager = parsedConfig.teamIDs?.userManager
    config.teamIDs.aiTeam = parsedConfig.teamIDs?.aiTeam
    config.userIds.apiKeyUser = parsedConfig.userIds?.apiKeyUser
  } catch (error) {
    console.error('Error parsing JR_IAM_CONFIG:', error)
  }

  return config
}

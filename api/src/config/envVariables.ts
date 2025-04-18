export const envApiKeyAuth = () => process.env.API_KEY_AUTH

export const envEnvironment = () => process.env.ENVIRONMENT as string

export const envDynamoDbEndpoint = () => process.env.DYNAMO_DB_ENDPOINT

export const envDynamoDbRegion = () => 'eu-central-1'

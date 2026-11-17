import { FastifyLoggerOptions, RawServerBase } from 'fastify'
import { PinoLoggerOptions } from 'fastify/types/logger'

export type EnvironemntType = 'development' | 'staging' | 'production' | 'test'

export type LoggerType =
  | boolean
  | (FastifyLoggerOptions<RawServerBase> & PinoLoggerOptions)

export type FastifyConfig = {
  currentEnv: EnvironemntType
  logger: {
    development: LoggerType
    production: LoggerType
    staging: LoggerType
    test: LoggerType
  }
  register: {
    prefix: string
    dynamoDbPrefix: string
  }
}

export type IamConfigType = {
  teamIDs: {
    // team id required for the /user-manager endpoint
    userManager?: string
    aiTeam?: string
  }
  userIds: {
    // user id of the api user masking/hiding
    apiKeyUser?: string
  }
}

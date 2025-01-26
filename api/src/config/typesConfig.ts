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
  }
}

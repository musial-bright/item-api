import { FastifyConfig } from './typesConfig'
import { currentEnvironment } from './variableConfig'

const Defaults = {
  urlSeparator: '/',
  dbSeparator: '-',
}

const stage = currentEnvironment()

const config: FastifyConfig = {
  currentEnv: stage,
  logger: {
    // development: { // // AWS and SAM dows not like it
    //   transport: {
    //     target: 'pino-pretty',
    //     options: {
    //       translateTime: 'HH:MM:ss Z',
    //       ignore: 'pid,hostname',
    //     },
    //   },
    // },
    development: true,
    production: true,
    staging: true,
    test: false,
  },
  register: {
    prefix: ['item-api', stage].join(Defaults.urlSeparator),
    dynamoDbPrefix: ['item-api', stage].join(Defaults.dbSeparator),
  },
}

export default config

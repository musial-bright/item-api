import { FastifyConfig } from './typesConfig'
import { currentEnvironemnt } from './variableConfig'

const config: FastifyConfig = {
  currentEnv: currentEnvironemnt(),
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
    prefix: 'item-api',
  },
}

export default config

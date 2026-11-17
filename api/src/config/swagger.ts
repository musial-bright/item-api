import { SwaggerOptions } from '@fastify/swagger'
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { FastifyInstance } from 'fastify'

import fastifyConfig from './fastifyConfig'
import { getLatestVersion } from '../changelog'

const indexPath = `/${fastifyConfig.register.prefix}/docs`

const SwaggerConfig: SwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Generic Item API',
      description: 'Generic Item API',
      version: getLatestVersion(),
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      // { name: 'api/item', description: 'User related end-points' },
      // { name: 'code', description: 'Code related end-points' }
    ],
    components: {
      // securitySchemes: {
      //   apiKey: {
      //     type: 'apiKey',
      //     name: 'apiKey',
      //     in: 'header'
      //   }
      // }
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here',
    },
  },
}

const SwaggerUIConfig: FastifySwaggerUiOptions = {
  routePrefix: indexPath,
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
}

const registerSwagger = (fastify: FastifyInstance) => {
  fastify.register(swagger, SwaggerConfig)
  fastify.register(swaggerUI, SwaggerUIConfig)
}

export { SwaggerConfig, SwaggerUIConfig, registerSwagger }

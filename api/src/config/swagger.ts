import { SwaggerOptions } from '@fastify/swagger'
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { FastifyInstance } from 'fastify'

import fastifyConfig from './fastifyConfig'

const indexPath = '/docs'

const SwaggerConfig: SwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Generic Item API',
      description: 'Generic Item API',
      version: '1.3.0',
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
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const swaggerUIRoute = async (fastify: FastifyInstance, _options: any) => {
    fastify.register(swaggerUI, SwaggerUIConfig)
  }
  fastify.register(swaggerUIRoute, { prefix: fastifyConfig.register.prefix })
}

export { SwaggerConfig, SwaggerUIConfig, registerSwagger }

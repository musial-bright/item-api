import Fastify, { FastifyInstance } from 'fastify'

import fastrifyConfig from './config/fastifyConfig'
// import { registerSwagger } from './config/swagger'

import authHook from './hooks/authHook'
import infoRoute from './routes/infoRoute'
import itemRoute from './routes/itemRoute'
import errorHandler from './handler/errorHandler'

const fastify: FastifyInstance = Fastify({
  logger: fastrifyConfig.logger[fastrifyConfig.currentEnv],
})

// Deactivate (uncomment) registerSwagger in case of AWS Lambda or SAM + Docker
// registerSwagger(fastify)

fastify.addHook('preHandler', authHook)

fastify.register(infoRoute, { prefix: fastrifyConfig.register.prefix })
fastify.register(itemRoute, { prefix: fastrifyConfig.register.prefix })

fastify.setErrorHandler(errorHandler)

export default fastify

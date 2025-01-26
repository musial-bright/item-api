import Fastify, { FastifyInstance } from 'fastify'

import fastifyConfig from './config/fastifyConfig'
// import { registerSwagger } from './config/swagger'

import authHook from './hooks/authHook'
import healthCheckRoute from './routes/healthCheckRoute'
import infoRoute from './routes/infoRoute'
import itemRoute from './routes/itemRoute'
import errorHandler from './handler/errorHandler'

const fastify: FastifyInstance = Fastify({
  logger: fastifyConfig.logger[fastifyConfig.currentEnv],
})

// Deactivate (uncomment) registerSwagger in case of AWS Lambda or SAM + Docker
// registerSwagger(fastify)

fastify.addHook('preHandler', authHook)

fastify.register(healthCheckRoute, { prefix: fastifyConfig.register.prefix })
fastify.register(infoRoute, { prefix: fastifyConfig.register.prefix })
fastify.register(itemRoute, { prefix: fastifyConfig.register.prefix })

fastify.setErrorHandler(errorHandler)

export default fastify

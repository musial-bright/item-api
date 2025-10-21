import Fastify, { FastifyInstance } from 'fastify'

import fastifyConfig from './config/fastifyConfig'

import authPlugin from './plugins/authPlugin'
import healthCheckRoute from './routes/healthCheckRoute'
import infoRoute from './routes/infoRoute'
import itemRoute from './routes/itemRoute'
import myItemRoute from './routes/myItemRoute'
import errorHandler from './handler/errorHandler'
import uploadFileUrl from './routes/uploadFileUrl'

const fastify: FastifyInstance = Fastify({
  logger: fastifyConfig.logger[fastifyConfig.currentEnv],
})

// Deactivate (uncomment) registerSwagger in case of AWS Lambda or SAM + Docker
// registerSwagger(fastify)

fastify.register(authPlugin)

fastify.register(healthCheckRoute, { prefix: fastifyConfig.register.prefix })
fastify.register(infoRoute, { prefix: fastifyConfig.register.prefix })
fastify.register(itemRoute, { prefix: fastifyConfig.register.prefix })
fastify.register(myItemRoute, { prefix: fastifyConfig.register.prefix })
fastify.register(uploadFileUrl, { prefix: fastifyConfig.register.prefix })

fastify.setErrorHandler(errorHandler)

export default fastify

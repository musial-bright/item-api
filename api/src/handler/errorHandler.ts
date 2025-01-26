import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import fastifyConfig from '../config/fastifyConfig'

const errorHandler = (
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (fastifyConfig.currentEnv !== 'test') {
    console.error(error)
  }

  reply.status(error.statusCode ? error.statusCode : 500).send({
    code: error.statusCode,
    error: error.message,
    name: error.name,
  })
}

export default errorHandler

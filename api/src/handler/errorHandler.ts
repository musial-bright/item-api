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

  const statusCode = error.statusCode !== undefined ? error.statusCode : 422
  // Scrivito stops request repeat when:
  //   `code: string`, `error: string` and `details: object | undefined`
  // If `details: string` then Scrivito will repeat the request
  const details = statusCode === 401 ? error.name : { name: error.name }
  const errorMessage = {
    code: statusCode.toString(),
    error: error.message,
    details,
  }

  reply.status(statusCode).send(errorMessage)
}

export default errorHandler

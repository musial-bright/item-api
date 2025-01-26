import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import schema from './healthCheckSchema'

const indexPath = '/health-check'

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const routes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get(
    indexPath,
    schema,
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const status = {
        access: 'OK',
      }

      reply.send({
        status,
        version: '1.0.0',
        date: new Date(),
      })
    },
  )
}

export default routes

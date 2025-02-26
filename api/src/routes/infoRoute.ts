import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import schema from './infoSchema'

const indexPath = '/info'

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const routes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get(
    indexPath,
    schema,
    async (_request: FastifyRequest, reply: FastifyReply) =>
      reply.send({
        info: {
          name: 'item-api',
          version: '1.0.0',
          copyright: 'Adam Musial-Bright',
          date: '2025-01-26 15:32',
        },
      }),
  )
}

export default routes

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
          version: '1.3.1',
          copyright: 'Adam Musial-Bright',
          date: '2026-02-32 17:35',
        },
      }),
  )
}

export default routes

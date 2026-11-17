import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import schema from './infoSchema'
import { changelog, getLatestVersion } from '../changelog'

const indexPath = '/info'

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const routes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get(
    indexPath,
    schema,
    async (_request: FastifyRequest, reply: FastifyReply) => {
      reply.send({
        info: {
          name: 'item-api',
          version: getLatestVersion(),
          copyright: 'Adam Musial-Bright',
          date: '2026-11-17',
          changelog,
        },
      })
    },
  )
}

export default routes

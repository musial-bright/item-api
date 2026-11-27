import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { schemaConfigGet, schemaConfigPatch } from './configSchema'
import { errorMessages, UnauthorizedError } from '../utils/errors'
import { getCurrentUser } from '../decorator/currentUser'
import {
  getGlobalConfig,
  updateGlobalConfig,
  GlobalConfigPatch,
} from '../service/globalConfigService'

const indexPath = '/config'

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const routes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get(
    indexPath,
    schemaConfigGet,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: errorMessages.unauthorized })
      }

      const config = await getGlobalConfig()

      return reply.send(config)
    },
  )

  fastify.patch(
    indexPath,
    schemaConfigPatch,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: errorMessages.unauthorized })
      }

      const patch = request.body as GlobalConfigPatch

      const config = await updateGlobalConfig(patch)

      return reply.send(config)
    },
  )
}

export default routes

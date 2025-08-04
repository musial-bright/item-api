import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'

import { CurrentUserType } from '../decorator/currentUser'
import authHook from '../hooks/authHook'

declare module 'fastify' {
  interface FastifyRequest {
    currentUser: CurrentUserType | undefined
  }
}

export interface AuthPluginOptions {
  currentUser: CurrentUserType | undefined
}

const authPluginAsync: FastifyPluginAsync = async (fastify, _options) => {
  fastify.decorateRequest('currentUser', undefined)

  fastify.addHook('onRequest', authHook)
}

export default fp(authPluginAsync)

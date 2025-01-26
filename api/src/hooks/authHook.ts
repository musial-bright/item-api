import { FastifyReply, FastifyRequest } from 'fastify'

import fastifyConfig from '../config/fastifyConfig'

import { authorizationGuard } from '../service/authorizationService'

const authHook = async (request: FastifyRequest, _reply: FastifyReply) => {
  if (request.url === `/${fastifyConfig.register.prefix}/health-check`) {
    return
  }

  await authorizationGuard(request.headers)
}

export default authHook

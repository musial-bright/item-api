import { FastifyReply, FastifyRequest } from 'fastify'

import { authorizationGuard } from '../service/authorizationService'

const authHook = async (request: FastifyRequest, _reply: FastifyReply) => {
  await authorizationGuard(request.headers)
}

export default authHook

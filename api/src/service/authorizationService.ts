import { FastifyRequest } from 'fastify'

import ApiKeyAuthorizer from '../authorizer/ApiKeyAuthorizer'
import { UnauthorizedError } from '../utils/errors'

/**
 * Authorization for user access.
 * In case of failure the `UnauthorizedError` error will be thrown.
 */
export const authorizationGuard = async (request: FastifyRequest) => {
  const apiAuhtorizer = new ApiKeyAuthorizer(request.headers)

  const apiAuhtorized = await apiAuhtorizer.isAuthroized()
  if (apiAuhtorized.success) {
    request.currentUser = {
      identifier: 'api_key',
      userinfo: undefined,
    }
    return
  }

  throw UnauthorizedError({ message: apiAuhtorized.message })
}

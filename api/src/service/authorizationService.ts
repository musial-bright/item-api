import { FastifyRequest } from 'fastify'

import ApiKeyAuthorizer from '../authorizer/ApiKeyAuthorizer'
import JrAuthorizer from '../authorizer/JrAuthorizer'
import { UnauthorizedError } from '../utils/errors'

/**
 * Authorization for user access.
 * In case of failure the `UnauthorizedError` error will be thrown.
 */
export const authorizationGuard = async (request: FastifyRequest) => {
  // Development only: static API key authorizer, tried before JrAuthorizer.
  const apiKeyAuthorizer = new ApiKeyAuthorizer(request.headers)
  const apiKeyAuthorizationResult = await apiKeyAuthorizer.isAuthorized()
  if (apiKeyAuthorizationResult.success) {
    request.currentUser = {
      identifier: 'api_key',
      userinfo: undefined,
    }
    return
  }

  const jrAuthorizer = new JrAuthorizer(request.headers)
  const jrAuthorizationResult = await jrAuthorizer.isAuthorized()
  if (jrAuthorizationResult.success) {
    request.currentUser = {
      identifier: jrAuthorizationResult.userinfo?.sub,
      userinfo: jrAuthorizationResult.userinfo,
    }
    return
  }

  throw UnauthorizedError({ message: jrAuthorizationResult.message })
}

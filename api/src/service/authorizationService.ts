import { IncomingHttpHeaders } from 'http'

import ApiKeyAuthorizer from '../authorizer/ApiKeyAuthorizer'
import { UnauthorizedError } from '../utils/errors'
import AbstractAuthorizer from '../authorizer/AbstractAuthorizer'

/**
 * Authorization for user access.
 * In case of failure the `UnauthorizedError` error will be thrown.
 */
export const authorizationGuard = async (headers: IncomingHttpHeaders) => {
  const authroizers: AbstractAuthorizer[] = [new ApiKeyAuthorizer(headers)]

  for (const authorizer of authroizers) {
    if (authorizer.isAuthroized()) {
      // authroization successful
      return
    }
  }

  throw UnauthorizedError()
}

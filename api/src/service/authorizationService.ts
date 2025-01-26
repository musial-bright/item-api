import { IncomingHttpHeaders } from 'http'

import { UnauthorizedError } from '../utils/errors'

/**
 * Authorization for user access.
 * In case of failure the `UnauthorizedError` error will be thrown.
 */
export const authorizationGuard = async (_headers: IncomingHttpHeaders) => {
  // Throw UnauthorizedError() when auth not successful
  throw UnauthorizedError()
}

import { IncomingHttpHeaders } from 'http'

import config from '../config/jrConfig'
import { UnauthorizedError } from './errors'

export const getAuthorizationToken = (headers: IncomingHttpHeaders) => {
  const authorization = headers.authorization
  if (!authorization || authorization.length === 0) {
    console.error(
      'getAuthorizationToken() authorization missing; headers:',
      headers,
    )
    throw UnauthorizedError({})
  }

  const token = authorization.split(' ')[1]
  if (!token || token.length === 0) {
    console.error('getAuthorizationToken() token missing; headers:', headers)
    throw UnauthorizedError({})
  }

  return token
}

export const prepareServiceParam = (headers: IncomingHttpHeaders) => {
  const { referer } = headers
  if (!referer) {
    return ''
  }

  const url = new URL(referer)

  const audienceKey = `${url.protocol}//${url.host}`
  const service = config.jrIam.audience[audienceKey]
  if (service) {
    return `service=${service}`
  }

  return `service=${config.jrIam.audience.fallback}`
}

import createError from 'http-errors'

import config from '../../config/jrConfig'
import { loadCachedToken, saveToken } from '../tokenStorage'
import { TokenResponse } from './utils/types'

const Defaults = {
  serviceEntity: {
    category: 'token',
    name: 'default',
  },
}

export const createServiceToken = async (
  forceNewToken: boolean = false,
): Promise<TokenResponse> => {
  if (forceNewToken === false) {
    const storedToken = await loadCachedToken({
      category: Defaults.serviceEntity.category,
      tokenName: Defaults.serviceEntity.name,
    })
    if (storedToken) {
      return storedToken as TokenResponse
    }
  }

  const response = await fetch(config.jrIam.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: [
      'grant_type=client_credentials',
      `client_id=${config.jrIam.tokenKey}`,
      `client_secret=${config.jrIam.tokenSecret}`,
    ].join('&'),
  })

  if (!response.ok) {
    const json = await response.json()
    const body = JSON.stringify(json)
    console.error('createServiceToken() error:', body)

    throw createError(response.status, body)
  }

  const body = await response.json()

  await saveToken({
    token: body,
    category: Defaults.serviceEntity.category,
    tokenName: Defaults.serviceEntity.name,
  })

  return body
}

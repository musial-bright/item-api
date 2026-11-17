import { expect, describe, it, jest, afterEach } from '@jest/globals'

import { StoredToken, TokenResponse } from '../../../service/iam/utils/types'

jest.mock('../../../config/variableConfig', () => {
  return {
    currentEnvironment: jest.fn().mockReturnValue('test'),
  }
})

jest.mock('../../../service/tokenStorage', () => {
  return {
    loadCachedToken: jest.fn(),
    saveToken: jest.fn(),
  }
})

import { createServiceToken } from '../../../service/iam/jrIamServiceToken'
import { loadCachedToken, saveToken } from '../../../service/tokenStorage'

const loadCachedTokenMock = jest.mocked(loadCachedToken)
const saveTokenMock = jest.mocked(saveToken)

afterEach(() => {
  jest.clearAllMocks()
  jest.restoreAllMocks()
})

describe('createServiceToken()', () => {
  it('returns the cached token without calling the token endpoint', async () => {
    const cachedToken: StoredToken = {
      access_token: 'cached-token',
      expires_in: 3600,
      token_type: 'Bearer',
      ttl: new Date().getTime() + 3600000,
      category: 'token',
      name: 'default',
    }
    loadCachedTokenMock.mockResolvedValue(cachedToken)
    const fetchSpy = jest.spyOn(global, 'fetch')

    const token = await createServiceToken()

    expect(token).toEqual(cachedToken)
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(saveTokenMock).not.toHaveBeenCalled()
  })

  it('fetches and stores a new token when no cached token exists', async () => {
    loadCachedTokenMock.mockResolvedValue(undefined)
    const newToken: TokenResponse = {
      access_token: 'new-token',
      expires_in: 3600,
      token_type: 'Bearer',
    }
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => newToken,
    } as Response)

    const token = await createServiceToken()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(token).toEqual(newToken)
    expect(saveTokenMock).toHaveBeenCalledWith({
      token: newToken,
      category: 'token',
      tokenName: 'default',
    })
  })

  it('forces a new token even if a cached one exists', async () => {
    const newToken: TokenResponse = {
      access_token: 'forced-new-token',
      expires_in: 3600,
      token_type: 'Bearer',
    }
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => newToken,
    } as Response)

    const token = await createServiceToken(true)

    expect(loadCachedTokenMock).not.toHaveBeenCalled()
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(token).toEqual(newToken)
  })

  it('throws and does not store a token when the token endpoint responds with an error', async () => {
    loadCachedTokenMock.mockResolvedValue(undefined)
    const errorBody = { error: 'invalid_client' }
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => errorBody,
    } as Response)

    await expect(createServiceToken()).rejects.toMatchObject({
      status: 401,
    })
    expect(saveTokenMock).not.toHaveBeenCalled()
  })
})

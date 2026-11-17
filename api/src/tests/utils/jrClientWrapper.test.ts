import { expect, describe, it, jest, afterEach } from '@jest/globals'

jest.mock('../../config/variableConfig', () => {
  return {
    currentEnvironment: jest.fn().mockReturnValue('test'),
  }
})

jest.mock('../../service/iam/jrIamServiceToken', () => {
  return {
    createServiceToken: jest.fn(),
  }
})

import { jrClientWrapper } from '../../utils/jrClientWrapper'
import { createServiceToken } from '../../service/iam/jrIamServiceToken'

const createServiceTokenMock = jest.mocked(createServiceToken)

afterEach(() => {
  jest.clearAllMocks()
})

describe('jrClientWrapper()', () => {
  it('returns the first response when it is not a 401', async () => {
    createServiceTokenMock.mockResolvedValue({
      access_token: 'token-0',
      expires_in: 3600,
      token_type: 'Bearer',
    })
    const response = { status: 200 } as Response
    const fnc = jest.fn<(accessToken: string) => Promise<Response>>(
      async () => response,
    )

    const result = await jrClientWrapper(fnc)

    expect(result).toBe(response)
    expect(fnc).toHaveBeenCalledTimes(1)
    expect(fnc).toHaveBeenCalledWith('token-0')
    expect(createServiceTokenMock).toHaveBeenCalledTimes(1)
  })

  it('retries with a forced new service token when the first response is a 401', async () => {
    createServiceTokenMock
      .mockResolvedValueOnce({
        access_token: 'token-0',
        expires_in: 3600,
        token_type: 'Bearer',
      })
      .mockResolvedValueOnce({
        access_token: 'token-1',
        expires_in: 3600,
        token_type: 'Bearer',
      })
    const firstResponse = { status: 401 } as Response
    const secondResponse = { status: 200 } as Response
    const fnc = jest
      .fn<(accessToken: string) => Promise<Response>>()
      .mockResolvedValueOnce(firstResponse)
      .mockResolvedValueOnce(secondResponse)

    const result = await jrClientWrapper(fnc)

    expect(result).toBe(secondResponse)
    expect(fnc).toHaveBeenCalledTimes(2)
    expect(fnc).toHaveBeenNthCalledWith(1, 'token-0')
    expect(fnc).toHaveBeenNthCalledWith(2, 'token-1')
    expect(createServiceTokenMock).toHaveBeenNthCalledWith(1)
    expect(createServiceTokenMock).toHaveBeenNthCalledWith(2, true)
  })

  it('retries with a forced new service token when the first call throws', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    createServiceTokenMock
      .mockResolvedValueOnce({
        access_token: 'token-0',
        expires_in: 3600,
        token_type: 'Bearer',
      })
      .mockResolvedValueOnce({
        access_token: 'token-1',
        expires_in: 3600,
        token_type: 'Bearer',
      })
    const secondResponse = { status: 200 } as Response
    const fnc = jest
      .fn<(accessToken: string) => Promise<Response>>()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce(secondResponse)

    const result = await jrClientWrapper(fnc)

    expect(result).toBe(secondResponse)
    expect(fnc).toHaveBeenCalledTimes(2)
    expect(createServiceTokenMock).toHaveBeenNthCalledWith(2, true)
    expect(console.log).toBeCalled()
  })
})

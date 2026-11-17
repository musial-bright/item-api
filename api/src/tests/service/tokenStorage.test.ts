import { expect, describe, it, jest, beforeAll, afterEach } from '@jest/globals'

import GenericResource from '../../entities/GenericResource'
import GenericResourceMock from '../__helpers__/GenericResourceMock'
import { ResourceAttributesType, ResourceType } from '../../entities/types'
import { IndexQueryCondition } from '../../utils/dynamoDbHelper'
import {
  isStoredTokenValid,
  loadCachedToken,
  saveToken,
  deleteToken,
} from '../../service/tokenStorage'
import { TokenResponse } from '../../service/iam/utils/types'

jest.mock('../../config/variableConfig', () => {
  return {
    currentEnvironment: jest.fn().mockReturnValue('test'),
  }
})

const items: ResourceType[] = [
  {
    category: 'token',
    name: 'default',
    access_token: '123asd',
    expires_in: 9000,
    token_type: 'Bearer',
    ttl: new Date().getTime() + 900000,
    created_at: 1,
    updated_at: 1,
  },
  {
    category: 'token',
    name: 'custom-token',
    access_token: 'custom123',
    expires_in: 8000,
    token_type: 'Bearer',
    ttl: new Date().getTime() + 800000,
    created_at: 2,
    updated_at: 2,
  },
  {
    category: 'user_token',
    name: 'user-123',
    access_token: 'cut_usertoken123',
    expires_in: 7000,
    token_type: 'Bearer',
    ttl: new Date().getTime() + 700000,
    created_at: 3,
    updated_at: 3,
  },
]

const resourceMock: GenericResourceMock = new GenericResourceMock({
  tableNameSuffix: 'service',
  indexNameSuffix: '',
  items,
})

beforeAll(() => {
  jest
    .spyOn(GenericResource.prototype, 'queryBy')
    .mockImplementation(
      async ({
        indexNameSuffix,
        conditions,
      }: {
        indexNameSuffix: string
        conditions: IndexQueryCondition[]
      }) => {
        return resourceMock.queryBy({
          indexNameSuffix,
          conditions,
        })
      },
    )

  jest
    .spyOn(GenericResource.prototype, 'get')
    .mockImplementation(async ({ keys }: { keys: ResourceAttributesType }) => {
      return await resourceMock.get({ keys })
    })

  jest
    .spyOn(GenericResource.prototype, 'create')
    .mockImplementation(
      async ({ attrs }: { attrs: ResourceAttributesType }) => {
        return await resourceMock.create({ attrs })
      },
    )

  jest
    .spyOn(GenericResource.prototype, 'update')
    .mockImplementation(
      async ({
        keys,
        attrs,
      }: {
        keys: ResourceAttributesType
        attrs: ResourceAttributesType
      }) => {
        return await resourceMock.update({ keys, attrs })
      },
    )

  jest
    .spyOn(GenericResource.prototype, 'delete')
    .mockImplementation(async ({ keys }: { keys: ResourceAttributesType }) => {
      return await resourceMock.delete({ keys })
    })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('loadCachedToken()', () => {
  it('has loaded a cached token', async () => {
    const token = await loadCachedToken({
      category: 'token',
      tokenName: 'default',
    })

    expect(token).toEqual(items[0])
  })

  it('has loaded a cached token with custom tokenName', async () => {
    const token = await loadCachedToken({
      category: 'token',
      tokenName: 'custom-token',
    })

    expect(token).toEqual(items[1])
    expect(token?.name).toEqual('custom-token')
    expect(token?.access_token).toEqual('custom123')
  })

  it('has loaded a cached token with custom category', async () => {
    const token = await loadCachedToken({
      category: 'user_token',
      tokenName: 'user-123',
    })

    expect(token).toEqual(items[2])
    expect(token?.category).toEqual('user_token')
    expect(token?.name).toEqual('user-123')
    expect(token?.access_token).toEqual('cut_usertoken123')
  })
})

describe('isStoredTokenValid', () => {
  it('has invalid token', () => {
    const token = {
      ...items[0],
      ttl: new Date().getTime() - 1000,
    }

    expect(isStoredTokenValid(token)).toBeFalsy()
  })

  it('has valid token', () => {
    const token = items[0]

    expect(isStoredTokenValid(token)).toBeTruthy()
  })
})

describe('saveToken', () => {
  it('saves token', async () => {
    const token: TokenResponse = {
      access_token: 'xyz',
      expires_in: 7000,
      token_type: 'Bearer',
    }

    const savedToken = await saveToken({
      token,
      category: 'token',
      tokenName: 'default',
    })

    expect(savedToken.access_token).toEqual(token.access_token)
    expect(savedToken.expires_in).toEqual(token.expires_in)
    expect(savedToken.token_type).toEqual(token.token_type)
    expect(savedToken.category).toEqual('token')
    expect(savedToken.name).toEqual('default')
    expect(savedToken.created_at).not.toBe(undefined)
    expect(savedToken.updated_at).not.toBe(undefined)
    expect(savedToken.created_at).toEqual(savedToken.updated_at)
  })

  it('saves token with custom tokenName', async () => {
    const token: TokenResponse = {
      access_token: 'custom-xyz',
      expires_in: 6000,
      token_type: 'Bearer',
    }

    const savedToken = await saveToken({
      token,
      category: 'token',
      tokenName: 'my-custom-token',
    })

    expect(savedToken.access_token).toEqual(token.access_token)
    expect(savedToken.expires_in).toEqual(token.expires_in)
    expect(savedToken.token_type).toEqual(token.token_type)
    expect(savedToken.category).toEqual('token')
    expect(savedToken.name).toEqual('my-custom-token')
    expect(savedToken.created_at).not.toBe(undefined)
    expect(savedToken.updated_at).not.toBe(undefined)
    expect(savedToken.created_at).toEqual(savedToken.updated_at)
  })

  it('saves token with custom category', async () => {
    const token: TokenResponse = {
      access_token: 'cut_newusertoken',
      expires_in: 5000,
      token_type: 'Bearer',
    }

    const savedToken = await saveToken({
      token,
      category: 'user_token',
      tokenName: 'user-456',
    })

    expect(savedToken.access_token).toEqual(token.access_token)
    expect(savedToken.expires_in).toEqual(token.expires_in)
    expect(savedToken.token_type).toEqual(token.token_type)
    expect(savedToken.category).toEqual('user_token')
    expect(savedToken.name).toEqual('user-456')
    expect(savedToken.created_at).not.toBe(undefined)
    expect(savedToken.updated_at).not.toBe(undefined)
    expect(savedToken.created_at).toEqual(savedToken.updated_at)
  })
})

describe('deleteToken', () => {
  it('deletes token', async () => {
    const result = await deleteToken({
      category: 'token',
      tokenName: 'custom-token',
    })

    expect(result).toBeTruthy()
  })

  it('deletes token with custom category', async () => {
    const result = await deleteToken({
      category: 'user_token',
      tokenName: 'user-123',
    })

    expect(result).toBeTruthy()
  })
})

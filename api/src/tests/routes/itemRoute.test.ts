import { expect, describe, it, jest, afterEach, beforeAll } from '@jest/globals'
import { v4 as uuidv4 } from 'uuid'

import fastifyConfig from '../../config/fastifyConfig'
import service from '../../service'

import { ResourceAttributesType, ResourceType } from '../../entities/types'
import {
  FilterExpression,
  IndexQueryCondition,
} from '../../utils/dynamoDbHelper'
import GenericResourceMock from '../__helpers__/GenericResourceMock'
import { currentUserFixture } from '../__fixtures__/currentUserFixture'
import GenericResource from '../../entities/GenericResource'
import { errorMessages } from '../../utils/errors'

jest.mock('../../config/variableConfig', () => {
  return {
    currentEnvironemnt: jest.fn().mockReturnValue('test'),
  }
})

jest.mock('../../service/authorizationService', () => {
  const original = jest.requireActual<
    typeof import('../../service/authorizationService')
  >('../../service/authorizationService')

  return {
    ...original,
    authorizationGuard: jest.fn().mockReturnValue(undefined),
  }
})

const userId0 = 'a100d2a7-90b1-4776-a0a2-bd4944b0e21a'
const userId1 = 'c000d2a7-90b1-4776-a0a2-bd4944b0e21c'
const userId2 = 'c100d2a7-90b1-4776-a0a2-bd4944b0e22c'

// provide current user with groups
jest.mock('../../decorator/currentUser', () => {
  const original = jest.requireActual<
    typeof import('../../decorator/currentUser')
  >('../../decorator/currentUser')
  return {
    ...original,
    getCurrentUser: jest.fn().mockImplementation(() => {
      const user = currentUserFixture('no-teams')
      user.identifier = userId0
      if (user.userinfo) {
        user.userinfo.sub = userId0
      }

      return user
    }),
  }
})

const uuid0 = '2700d2a7-90b1-4776-a0a2-bd4944b0e29e'
const uuid1 = '3000d2a7-90b1-4776-a0a2-bd4944b0e21a'
const uuid2 = '4000d2a7-90b1-4776-a0a2-bd4944b0e21a'
const uuid3 = '5000d2a7-90b1-4776-a0a2-bd4944b0e21a'

const itemName0 = 'some-item'
const itemName1 = 'other-item'

const items: ResourceType[] = [
  {
    id: uuid0,
    name: itemName0,
    content: {
      desc: 'test content 0',
      items: [1, 2, 'three'],
    },
    user_id: userId0,
    created_at: 1752652800763,
    updated_at: 1752666420763,
    created_at_iso: '2025-07-16T08:00:00.763Z',
    updated_at_iso: '2025-07-16T11:47:00.763Z',
  },
  {
    id: uuidv4(),
    name: itemName0,
    director: 'Stanley Kubrick',
    age: 70,
    quality: 'excellent',
    birthday: '1928-07-26T00:00:00.000Z',
    user_id: userId0,
    created_at: 1752652800763,
    updated_at: 1752666420763,
    created_at_iso: '2025-07-16T08:00:00.763Z',
    updated_at_iso: '2025-07-16T11:47:00.763Z',
  },
  {
    id: uuidv4(),
    name: itemName0,
    director: 'Sofia Coppola',
    age: 50,
    quality: 'good',
    birthday: '1971-05-14T00:00:00.000Z',
    user_id: userId0,
    created_at: 1752652800763,
    updated_at: 1752666420763,
    created_at_iso: '2025-07-16T08:00:00.763Z',
    updated_at_iso: '2025-07-16T11:47:00.763Z',
  },
  {
    id: uuidv4(),
    name: itemName0,
    director: 'David Fincher',
    age: 60,
    quality: 'good',
    birthday: '1962-08-28T00:00:00.000Z',
    user_id: userId0,
    created_at: 1752652800763,
    updated_at: 1752666420763,
    created_at_iso: '2025-07-16T08:00:00.763Z',
    updated_at_iso: '2025-07-16T11:47:00.763Z',
  },
  {
    id: uuid1,
    name: itemName0,
    content: {
      desc: 'test content 1',
      items: ['2001', 'Full Metal Jacket'],
    },
    user_id: userId1,
    created_at: 1752652800763,
    updated_at: 1752666420763,
    created_at_iso: '2025-07-16T08:00:00.763Z',
    updated_at_iso: '2025-07-16T11:47:00.763Z',
  },
  {
    id: uuid2,
    name: itemName1,
    content: {
      desc: 'test content 2',
      items: [],
    },
    user_id: userId2,
    created_at: 1752652800763,
    updated_at: 1752666420763,
    created_at_iso: '2025-07-16T08:00:00.763Z',
    updated_at_iso: '2025-07-16T11:47:00.763Z',
  },
  {
    id: uuid3,
    name: itemName1,
    content: {
      desc: 'test content 3',
      items: [],
    },
    created_at: 1752652800763,
    updated_at: 1752666420763,
    created_at_iso: '2025-07-16T08:00:00.763Z',
    updated_at_iso: '2025-07-16T11:47:00.763Z',
  },
]

let resourceMock: GenericResourceMock = new GenericResourceMock({
  tableNameSuffix: itemName0,
  indexNameSuffix: 'by-user-id-and-name',
  items,
})

beforeAll(() => {
  jest
    .spyOn(GenericResource.prototype, 'queryBy')
    .mockImplementation(
      async ({
        indexNameSuffix,
        conditions,
        filterExpressions,
      }: {
        indexNameSuffix: string
        conditions: IndexQueryCondition[]
        filterExpressions?: FilterExpression[]
      }) => {
        return resourceMock.queryBy({
          indexNameSuffix,
          conditions,
          filterExpressions,
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
  resourceMock = new GenericResourceMock({
    tableNameSuffix: itemName0,
    indexNameSuffix: 'by-user-id-and-name',
    items,
  })
  jest.clearAllMocks()
})

describe('routes', () => {
  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}`, () => {
    it(`get all ${itemName0} items`, async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}`,
      })
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)

      const expectedItemsRaw = items.filter((i) => {
        return i.name === itemName0 && i.user_id === userId0
      })

      const expectedItems = expectedItemsRaw.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_id, ...sanisanitizedItem } = item
        return sanisanitizedItem
      })

      expect(body.results).toEqual(expectedItems)
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName1}`, () => {
    it(`get no ${itemName1} because of permissions/user_id`, async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName1}`,
      })
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      expect(body.results).toEqual([])
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}/not-existing-id`, () => {
    it('get fails with 404', async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/not-existing-id`,
      })

      expect(response.statusCode).toBe(404)

      const body = JSON.parse(response.body)
      expect(body).toEqual({
        code: '404',
        error: 'not found',
        details: { name: 'NotFoundError' },
      })
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}/${uuid0}`, () => {
    it('gets specific item', async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/${uuid0}`,
      })
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      const itemRaw = items.find((i) => i.id === uuid0)
      const item = { ...itemRaw }

      expect(body.created_at).toEqual(item.created_at)
      expect(body.id).toEqual(item.id)
      expect(body.name).toEqual(item.name)
      expect(body.updated_at).toEqual(item.updated_at)
      expect(body.user_id).toEqual(undefined)
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}/${uuid1}`, () => {
    it('get fails with 403 forbidden', async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/${uuid1}`,
      })
      expect(response.statusCode).toBe(403)

      const body = JSON.parse(response.body)
      expect(body).toEqual({
        code: '403',
        error: errorMessages.forbidden,
        details: { name: 'ForbiddenError' },
      })
    })
  })

  describe(`POST /${fastifyConfig.register.prefix}/item/${itemName0}`, () => {
    it('creates new item', async () => {
      const payload = {
        content: { desc: 'new content', attribute: 1234567890 },
      }
      const responsePost = await service.inject({
        method: 'POST',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}`,
        payload: payload,
      })
      expect(responsePost.statusCode).toBe(201)

      const expectedPostBody = {
        name: itemName0,
        content: payload.content,
        user_id: userId0,
      }
      const responsePostBody = JSON.parse(responsePost.body)
      expect(responsePostBody.name).toEqual(expectedPostBody.name)
      expect(responsePostBody.content).toEqual(expectedPostBody.content)

      const responseGet = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/${responsePostBody.id}`,
      })
      expect(responseGet.statusCode).toBe(200)

      const bodyGet = JSON.parse(responseGet.body)
      expect(bodyGet.id).toEqual(responsePostBody.id)
      expect(bodyGet.name).toEqual(expectedPostBody.name)
      expect(bodyGet.user_id).toEqual(undefined)
      expect(bodyGet.content).toEqual(expectedPostBody.content)
      expect(bodyGet.created_at).not.toBe(undefined)
      expect(bodyGet.updated_at).not.toBe(undefined)
      expect(bodyGet.created_at).toEqual(bodyGet.updated_at)
    })
  })

  describe(`PATCH /${fastifyConfig.register.prefix}/item/${itemName0}/not-existing-id`, () => {
    it('update fails with 404', async () => {
      const payload = { content: { desc: 'updated-content', something: 9 } }
      const responsePatch = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/not-existing-id`,
        payload: payload,
      })

      expect(responsePatch.statusCode).toBe(404)

      const body = JSON.parse(responsePatch.body)
      expect(body).toEqual({
        code: '404',
        error: 'not found',
        details: { name: 'NotFoundError' },
      })
    })
  })

  describe(`PATCH /${fastifyConfig.register.prefix}/item/${itemName0}/${uuid0}`, () => {
    it('updates content', async () => {
      const payload = { content: { desc: 'updated-content' } }
      const responsePatch = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/${uuid0}`,
        payload: payload,
      })

      expect(responsePatch.statusCode).toBe(200)

      const body = JSON.parse(responsePatch.body)
      const expectedPostBody = {
        id: body.id,
        name: itemName0,
        content: payload.content,
      }
      expect(body.id).not.toBe(undefined)
      expect(body.name).toEqual(expectedPostBody.name)
      expect(body.user_id).toEqual(undefined)
      expect(body.content).toEqual(expectedPostBody.content)
      expect(body.created_at).not.toBe(undefined)
      expect(body.updated_at).not.toBe(undefined)
      expect(body.created_at < body.updated_at).toBeTruthy()
    })
  })

  describe(`PATCH /${fastifyConfig.register.prefix}/item/${itemName0}/${uuid1}`, () => {
    it('update fails with 403 forbidden', async () => {
      const payload = { content: { desc: 'updated-content' } }
      const responsePatch = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/${uuid1}`,
        payload: payload,
      })

      expect(responsePatch.statusCode).toBe(403)

      const body = JSON.parse(responsePatch.body)
      expect(body).toEqual({
        code: '403',
        error: errorMessages.forbidden,
        details: { name: 'ForbiddenError' },
      })
    })
  })

  describe(`DELETE /${fastifyConfig.register.prefix}/item/${itemName0}/not-existing-id`, () => {
    it('deletes fails with 404', async () => {
      const responseDelete = await service.inject({
        method: 'DELETE',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/not-existing-id`,
      })

      expect(responseDelete.statusCode).toBe(404)

      const body = JSON.parse(responseDelete.body)
      expect(body).toEqual({
        code: '404',
        error: 'not found',
        details: { name: 'NotFoundError' },
      })
    })
  })

  describe(`DELETE /${fastifyConfig.register.prefix}/item/${itemName0}/${uuid0}`, () => {
    it('deletes item', async () => {
      const responseDelete = await service.inject({
        method: 'DELETE',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/${uuid0}`,
      })
      expect(responseDelete.statusCode).toBe(204)

      const body = responseDelete.body
      expect(body).toBe('')

      const responseGet = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/${uuid0}`,
      })

      expect(responseGet.statusCode).toBe(404)

      const bodyGet = JSON.parse(responseGet.body)
      expect(bodyGet).toEqual({
        code: '404',
        error: 'not found',
        details: { name: 'NotFoundError' },
      })
    })
  })

  describe(`DELETE /${fastifyConfig.register.prefix}/item/${itemName0}/${uuid1}`, () => {
    it('deletes fails with 403 forbidden', async () => {
      const responseDelete = await service.inject({
        method: 'DELETE',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/${uuid1}`,
      })

      expect(responseDelete.statusCode).toBe(403)

      const body = JSON.parse(responseDelete.body)
      expect(body).toEqual({
        code: '403',
        error: errorMessages.forbidden,
        details: { name: 'ForbiddenError' },
      })
    })
  })
})

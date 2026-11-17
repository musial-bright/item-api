import {
  expect,
  describe,
  it,
  jest,
  afterEach,
  beforeEach,
} from '@jest/globals'

import fastifyConfig from '../../config/fastifyConfig'
import service from '../../service'

import { ResourceAttributesType, ResourceType } from '../../entities/types'
import { IndexQueryCondition } from '../../utils/dynamoDbHelper'
import { currentUserFixture } from '../__fixtures__/currentUserFixture'
import GenericResourceMock from '../__helpers__/GenericResourceMock'
import GenericResource from '../../entities/GenericResource'
import { errorMessages } from '../../utils/errors'
import { IdPartSeparator } from '../../entities/MyItem'

jest.mock('../../config/variableConfig', () => {
  return {
    currentEnvironment: jest.fn().mockReturnValue('test'),
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
const userId1 = 'b000d2a7-90b1-4776-a0a2-bd4944b0e21b'
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

const itemName0 = 'some-item'
const itemName1 = 'other-item'
const itemNameNew = 'new-item'

const uuid0 = [userId0, itemName0].join(IdPartSeparator)
const uuid1 = [userId1, itemName0].join(IdPartSeparator)
const uuid2 = [userId2, itemName1].join(IdPartSeparator)
const uuid3 = ['', itemName1].join(IdPartSeparator) // with missing user_id

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

beforeEach(() => {
  const resourceMock: GenericResourceMock = new GenericResourceMock({
    tableNameSuffix: itemName0,
    indexNameSuffix: 'by-user-id-and-name',
    items: [...items],
  })

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

describe('routes', () => {
  describe(`GET /${fastifyConfig.register.prefix}/my-item/${itemName0}`, () => {
    it(`get ${itemName0} item`, async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/my-item/${itemName0}`,
      })
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)

      const expectedItem = items.find((i) => {
        return i.name === itemName0 && i.user_id === userId0
      })

      expect(body.id).toBe(undefined)
      expect(body.id).toEqual(undefined)
      expect(body.user_id).toEqual(undefined)
      expect(body.name).toEqual(expectedItem?.name)
      expect(body.name).toEqual(expectedItem?.name)
      expect(body.created_at).toEqual(expectedItem?.created_at)
      expect(body.updated_at).toEqual(expectedItem?.updated_at)
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/my-item/${itemName1}`, () => {
    it(`get no ${itemName1} because of permissions/user_id`, async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/my-item/${itemName1}`,
      })
      expect(response.statusCode).toBe(404)

      const body = JSON.parse(response.body)
      expect(body).toEqual({
        code: '404',
        error: errorMessages.notFound,
        details: { name: 'NotFoundError' },
      })
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/my-item/not-existing-id`, () => {
    it('get fails with 404', async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/my-item/not-existing-id`,
      })

      expect(response.statusCode).toBe(404)

      const body = JSON.parse(response.body)
      expect(body).toEqual({
        code: '404',
        error: errorMessages.notFound,
        details: { name: 'NotFoundError' },
      })
    })
  })

  describe(`POST /${fastifyConfig.register.prefix}/my-item/${itemNameNew}`, () => {
    it('creates new item', async () => {
      const payload = {
        content: { desc: 'new content', attribute: 1234567890 },
      }
      const responsePost = await service.inject({
        method: 'POST',
        url: `/${fastifyConfig.register.prefix}/my-item/${itemNameNew}`,
        payload: payload,
      })
      expect(responsePost.statusCode).toBe(201)

      const expectedPostBody = {
        name: itemNameNew,
        content: payload.content,
      }
      const responsePostBody = JSON.parse(responsePost.body)
      expect(responsePostBody.name).toEqual(expectedPostBody.name)
      expect(responsePostBody.content).toEqual(expectedPostBody.content)

      const responseGet = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/my-item/${itemNameNew}`,
      })
      expect(responseGet.statusCode).toBe(200)

      const bodyGet = JSON.parse(responseGet.body)
      expect(bodyGet.id).toBe(undefined)
      expect(bodyGet.name).toEqual(expectedPostBody.name)
      expect(bodyGet.user_id).toEqual(undefined)
      expect(bodyGet.content).toEqual(expectedPostBody.content)
      expect(bodyGet.created_at).not.toBe(undefined)
      expect(bodyGet.updated_at).not.toBe(undefined)
      expect(bodyGet.created_at).toEqual(bodyGet.updated_at)
    })
  })

  describe(`POST /${fastifyConfig.register.prefix}/my-item/${itemName0}`, () => {
    it('creates new item on an existing one will return the original item without change', async () => {
      const payload = {
        content: { desc: 'new content 2', attribute: 987654321 },
      }
      const responsePost = await service.inject({
        method: 'POST',
        url: `/${fastifyConfig.register.prefix}/my-item/${itemName0}`,
        payload: payload,
      })
      expect(responsePost.statusCode).toBe(201)

      const expectedItem = items.find((i) => {
        return i.name === itemName0 && i.user_id === userId0
      })

      const responsePostBody = JSON.parse(responsePost.body)
      expect(responsePostBody.name).toEqual(expectedItem!.name)
      expect(responsePostBody.content).toEqual(expectedItem!.content)
      expect(responsePostBody.created_at).toEqual(expectedItem!.created_at)
      expect(responsePostBody.created_at_iso).toEqual(
        expectedItem!.created_at_iso,
      )
      expect(responsePostBody.updated_at).toEqual(expectedItem!.updated_at)
      expect(responsePostBody.updated_at_iso).toEqual(
        expectedItem!.updated_at_iso,
      )
    })
  })

  describe(`PATCH /${fastifyConfig.register.prefix}/my-item/not-existing-id`, () => {
    it('update fails with 404', async () => {
      const payload = { content: { desc: 'updated-content', something: 9 } }
      const responsePatch = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/my-item/not-existing-id`,
        payload: payload,
      })

      expect(responsePatch.statusCode).toBe(404)

      const body = JSON.parse(responsePatch.body)
      expect(body).toEqual({
        code: '404',
        error: errorMessages.notFound,
        details: { name: 'NotFoundError' },
      })
    })
  })

  describe(`PATCH /${fastifyConfig.register.prefix}/my-item/${itemName0}`, () => {
    it('updates content', async () => {
      const payload = { content: { desc: 'updated-content' } }
      const responsePatch = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/my-item/${itemName0}`,
        payload: payload,
      })

      expect(responsePatch.statusCode).toBe(200)

      const body = JSON.parse(responsePatch.body)
      const expectedPostBody = {
        name: itemName0,
        content: payload.content,
      }

      expect(body.id).toBe(undefined)
      expect(body.name).toEqual(expectedPostBody.name)
      expect(body.user_id).toEqual(undefined)
      expect(body.content).toEqual(expectedPostBody.content)
      expect(body.created_at).not.toBe(undefined)
      expect(body.updated_at).not.toBe(undefined)
      expect(
        new Date(body.created_at).getTime() <
          new Date(body.updated_at).getTime(),
      ).toBeTruthy()
    })
  })

  describe(`PATCH /${fastifyConfig.register.prefix}/my-item/${itemName1}`, () => {
    it('update fails with 404', async () => {
      const payload = { content: { desc: 'updated-content' } }
      const responsePatch = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/my-item/${itemName1}`,
        payload: payload,
      })

      expect(responsePatch.statusCode).toBe(404)

      const body = JSON.parse(responsePatch.body)
      expect(body).toEqual({
        code: '404',
        error: errorMessages.notFound,
        details: { name: 'NotFoundError' },
      })
    })
  })

  describe(`DELETE /${fastifyConfig.register.prefix}/my-item/not-existing-id`, () => {
    it('deletes fails with 404', async () => {
      const responseDelete = await service.inject({
        method: 'DELETE',
        url: `/${fastifyConfig.register.prefix}/my-item/not-existing-id`,
      })

      expect(responseDelete.statusCode).toBe(404)

      const body = JSON.parse(responseDelete.body)
      expect(body).toEqual({
        code: '404',
        error: errorMessages.notFound,
        details: { name: 'NotFoundError' },
      })
    })
  })

  describe(`DELETE /${fastifyConfig.register.prefix}/my-item/${itemName0}`, () => {
    it('deletes item', async () => {
      const responseDelete = await service.inject({
        method: 'DELETE',
        url: `/${fastifyConfig.register.prefix}/my-item/${itemName0}`,
      })
      expect(responseDelete.statusCode).toBe(204)

      const body = responseDelete.body
      expect(body).toBe('')

      const responseGet = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/my-item/${itemName0}`,
      })

      expect(responseGet.statusCode).toBe(404)

      const bodyGet = JSON.parse(responseGet.body)
      expect(bodyGet).toEqual({
        code: '404',
        error: errorMessages.notFound,
        details: { name: 'NotFoundError' },
      })
    })
  })

  describe(`DELETE /${fastifyConfig.register.prefix}/my-item/${itemName1}`, () => {
    it('deletes fails with 404', async () => {
      const responseDelete = await service.inject({
        method: 'DELETE',
        url: `/${fastifyConfig.register.prefix}/my-item/${itemName1}`,
      })

      expect(responseDelete.statusCode).toBe(404)

      const body = JSON.parse(responseDelete.body)
      expect(body).toEqual({
        code: '404',
        error: errorMessages.notFound,
        details: { name: 'NotFoundError' },
      })
    })
  })
})

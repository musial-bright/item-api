import { expect, describe, it, jest, afterEach, beforeAll } from '@jest/globals'

import fastifyConfig from '../../config/fastifyConfig'
import service from '../../service'
import Resource from '../../entities/Resource'

import ResourceMock, { ResourceTypeMock } from '../entities/ResourceMock'
import { ResourceType } from '../../entities/types'
import { IndexQueryCondition } from '../../utils/dynamoDbHelper'

jest.mock('../../config/variableConfig', () => {
  return {
    currentEnvironemnt: jest.fn().mockReturnValue('test'),
  }
})

jest.mock('../../service/authorizationService', () => {
  return {
    authorizationGuard: jest.fn().mockReturnValue({}),
  }
})

jest.mock('../../decorator/currentUser', () => {
  const original = jest.requireActual<
    typeof import('../../decorator/currentUser')
  >('../../decorator/currentUser')
  return {
    ...original,
    getCurrentUser: jest.fn().mockReturnValue({
      identifier: 'api_key',
      userinfo: undefined,
    }),
  }
})

const uuid0 = '2700d2a7-90b1-4776-a0a2-bd4944b0e29e'
const uuid1 = '3000d2a7-90b1-4776-a0a2-bd4944b0e21a'
const uuid2 = '4000d2a7-90b1-4776-a0a2-bd4944b0e21a'
const uuid3 = '5000d2a7-90b1-4776-a0a2-bd4944b0e21a'

const itemName0 = 'some-item'
const itemName1 = 'other-item'

const userId0 = 'api_key'
const userId1 = 'c000d2a7-90b1-4776-a0a2-bd4944b0e21c'
const userId2 = 'c100d2a7-90b1-4776-a0a2-bd4944b0e22c'

const items: ResourceTypeMock[] = [
  {
    id: uuid0,
    name: itemName0,
    content: {
      desc: 'test content 0',
      items: [1, 2, 'three'],
    },
    user_id: userId0,
  },
  {
    id: uuid1,
    name: itemName0,
    content: {
      desc: 'test content 1',
      items: ['2001', 'Full Metal Jacket'],
    },
    user_id: userId1,
  },
  {
    id: uuid2,
    name: itemName1,
    content: {
      desc: 'test content 2',
      items: [],
    },
    user_id: userId2,
  },
  {
    id: uuid3,
    name: itemName1,
    content: {
      desc: 'test content 3',
      items: [],
    },
  },
]

let resourceMock: ResourceMock = new ResourceMock({
  tableNameSuffix: itemName0,
  indexNameSuffix: 'by-user-id-and-name',
  items,
})

beforeAll(() => {
  jest
    .spyOn(Resource.prototype, 'queryBy')
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
  // .mockImplementation(
  //   async ({
  //     indexNameSuffix,
  //     attributeName,
  //     attributeValue,
  //     condition,
  //   }: {
  //     indexNameSuffix: string
  //     attributeName: string
  //     attributeValue: string
  //     condition: string
  //   }) => {
  //     return resourceMock.queryBy({
  //       indexNameSuffix,
  //       attributeName,
  //       attributeValue,
  //       condition,
  //     })
  //   },
  // )

  jest
    .spyOn(Resource.prototype, 'get')
    .mockImplementation(async ({ id }: { id: string }) => {
      return await resourceMock.get({ id })
    })

  jest
    .spyOn(Resource.prototype, 'create')
    .mockImplementation(async ({ attrs }: { attrs: ResourceType }) => {
      return await resourceMock.create({ attrs })
    })

  jest
    .spyOn(Resource.prototype, 'update')
    .mockImplementation(
      async ({ id, attrs }: { id: string; attrs: ResourceType }) => {
        return await resourceMock.update({ id, attrs })
      },
    )

  jest
    .spyOn(Resource.prototype, 'delete')
    .mockImplementation(async ({ id }: { id: string }) => {
      return await resourceMock.delete({ id })
    })
})

afterEach(() => {
  resourceMock = new ResourceMock({
    tableNameSuffix: itemName0,
    indexNameSuffix: 'by-name',
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
      const expectedItems = items.filter((i) => {
        return i.name === itemName0 && i.user_id === userId0
      })
      expect(body).toEqual(Object.values(expectedItems))
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
      expect(body).toEqual([])
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}/not-existing-id`, () => {
    it('get fails with 404', async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/not-existing-id`,
      })
      expect(response.statusCode).toBe(404)
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
      const item = items.find((i) => i.id === uuid0)
      expect(body).toEqual(item)
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}/${uuid1}`, () => {
    it('get fails with 403', async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/${uuid1}`,
      })
      expect(response.statusCode).toBe(403)

      const body = JSON.parse(response.body)
      expect(body).toEqual({
        code: 403,
        error: 'item forbidden',
        name: 'ForbiddenError',
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
      const { id, name, content } = JSON.parse(responsePost.body)
      expect(name).toEqual(expectedPostBody.name)
      expect(content).toEqual(expectedPostBody.content)

      const responseGet = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/${id}`,
      })
      expect(responseGet.statusCode).toBe(200)

      const bodyGet = JSON.parse(responseGet.body)
      expect(bodyGet).toEqual({
        ...expectedPostBody,
        id,
      })
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
        user_id: userId0,
      }
      expect(body).toEqual(expectedPostBody)
    })
  })

  describe(`PATCH /${fastifyConfig.register.prefix}/item/${itemName0}/${uuid1}`, () => {
    it('update fails with 403', async () => {
      const payload = { content: { desc: 'updated-content' } }
      const responsePatch = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/${uuid1}`,
        payload: payload,
      })

      expect(responsePatch.statusCode).toBe(403)

      const body = JSON.parse(responsePatch.body)
      expect(body).toEqual({
        code: 403,
        error: 'item forbidden',
        name: 'ForbiddenError',
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
    })
  })

  describe(`DELETE /${fastifyConfig.register.prefix}/item/${itemName0}/${uuid1}`, () => {
    it('deletes fails with 403', async () => {
      const responseDelete = await service.inject({
        method: 'DELETE',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}/${uuid1}`,
      })

      expect(responseDelete.statusCode).toBe(403)
    })
  })
})

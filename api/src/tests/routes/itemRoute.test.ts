import { expect, describe, it, jest, afterEach, beforeAll } from '@jest/globals'

import fastifyConfig from '../../config/fastifyConfig'
import service from '../../service'
import Resource from '../../entities/Resource'

import ResourceMock, { TablesType } from '../entities/ResourceMock'
import { ResourceType } from '../../entities/types'
import { tableIndexName, tableName } from '../../utils/tableName'

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

const uuid0 = '2700d2a7-90b1-4776-a0a2-bd4944b0e29e'

const itemName = 'some-item'

const tablesData: TablesType = [
  {
    tableNameSuffix: itemName,
    indexNameSuffix: 'by-name',
    tableName: tableName({ tableNameSuffix: itemName }),
    indexName: tableIndexName({
      tableNameSuffix: itemName,
      indexNameSuffix: 'by-name',
    }),
    items: [
      {
        id: uuid0,
        name: itemName,
        content: {
          desc: 'test content 0',
          items: [1, 2, 'three'],
        },
      },
    ],
  },
  {
    tableNameSuffix: 'user',
    indexNameSuffix: 'by-email',
    tableName: tableName({ tableNameSuffix: 'user' }),
    indexName: tableIndexName({
      tableNameSuffix: itemName,
      indexNameSuffix: 'by-name',
    }),
    items: [
      {
        id: 'some-user-id',
        name: 'not necessary for user',
      },
    ],
  },
]

const resourceMock = new ResourceMock(tablesData)

beforeAll(() => {
  jest
    .spyOn(Resource.prototype, 'queryBy')
    .mockImplementation(
      async ({
        indexNameSuffix,
        attributeName,
        attributeValue,
        condition,
      }: {
        indexNameSuffix: string
        attributeName: string
        attributeValue: string
        condition: string
      }) => {
        return resourceMock.queryBy({
          indexNameSuffix,
          attributeName,
          attributeValue,
          condition,
        })
      },
    )
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
  jest.clearAllMocks()
})

describe('routes', () => {
  describe(`GET /${fastifyConfig.register.prefix}/item/some-item`, () => {
    it('get all items', async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/some-item`,
      })
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      const expectedItems = tablesData.filter(
        (t) => t.tableNameSuffix === itemName,
      )[0].items
      expect(body).toEqual(Object.values(expectedItems))
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/item/some-item/not-existing-id`, () => {
    it('get fails with 404', async () => {
      const response = await service.inject({
        method: 'GET',
        url: '/${fastifyConfig.register.prefix}/item/some-item/not-existing-id',
      })
      expect(response.statusCode).toBe(404)
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/item/some-item/${uuid0}`, () => {
    it('gets specific item', async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/some-item/${uuid0}`,
      })
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      const item = tablesData
        .filter((t) => t.tableNameSuffix === itemName)[0]
        .items.filter((i) => i.id === uuid0)[0]
      expect(body).toEqual(item)
    })
  })

  describe(`POST /${fastifyConfig.register.prefix}/item/some-item`, () => {
    it('creates new item', async () => {
      const payload = {
        content: { desc: 'new content', attribute: 1234567890 },
      }
      const responsePost = await service.inject({
        method: 'POST',
        url: `/${fastifyConfig.register.prefix}/item/some-item`,
        payload: payload,
      })
      expect(responsePost.statusCode).toBe(201)

      const expectedPostBody = {
        name: itemName,
        content: payload.content,
      }
      const { id, name, content } = JSON.parse(responsePost.body)
      expect(name).toEqual(expectedPostBody.name)
      expect(content).toEqual(expectedPostBody.content)

      const responseGet = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/some-item/${id}`,
      })
      expect(responseGet.statusCode).toBe(200)

      const bodyGet = JSON.parse(responseGet.body)
      expect(bodyGet).toEqual({
        ...expectedPostBody,
        id,
      })
    })
  })

  describe(`PATCH /${fastifyConfig.register.prefix}/item/some-item/not-existing-id`, () => {
    it('delete fails with 404', async () => {
      const payload = { content: { desc: 'updated-content', something: 9 } }
      const responsePatch = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/item/some-item/not-existing-id`,
        payload: payload,
      })

      expect(responsePatch.statusCode).toBe(404)
    })
  })

  describe(`PATCH /${fastifyConfig.register.prefix}/item/some-item/${uuid0}`, () => {
    it('updates content', async () => {
      const payload = { content: { desc: 'updated-content' } }
      const responsePatch = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/item/some-item/${uuid0}`,
        payload: payload,
      })
      expect(responsePatch.statusCode).toBe(200)

      const body = JSON.parse(responsePatch.body)
      const expectedPostBody = {
        id: body.id,
        name: itemName,
        content: payload.content,
      }
      expect(body).toEqual(expectedPostBody)
    })
  })

  describe(`DELETE /${fastifyConfig.register.prefix}/item/some-item/not-existing-id`, () => {
    it('deletes fails with 404', async () => {
      const responseDelete = await service.inject({
        method: 'DELETE',
        url: `/${fastifyConfig.register.prefix}/item/some-item/not-existing-id`,
      })

      expect(responseDelete.statusCode).toBe(404)
    })
  })

  describe(`DELETE /${fastifyConfig.register.prefix}/item/some-item/${uuid0}`, () => {
    it('deletes item', async () => {
      const responseDelete = await service.inject({
        method: 'DELETE',
        url: `/${fastifyConfig.register.prefix}/item/some-item/${uuid0}`,
      })

      expect(responseDelete.statusCode).toBe(204)

      const body = responseDelete.body
      expect(body).toBe('')

      const responseGet = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/some-item/${uuid0}`,
      })

      expect(responseGet.statusCode).toBe(404)
    })
  })
})

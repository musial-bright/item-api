import {
  expect,
  describe,
  it,
  jest,
  afterEach,
  beforeEach,
} from '@jest/globals'
import { v4 as uuidv4 } from 'uuid'

import fastifyConfig from '../../config/fastifyConfig'
import service from '../../service'

import { ResourceAttributesType, ResourceType } from '../../entities/types'
import {
  FilterExpression,
  IndexQueryCondition,
} from '../../utils/dynamoDbHelper'
import { currentUserFixture } from '../__fixtures__/currentUserFixture'
import GenericResourceMock from '../__helpers__/GenericResourceMock'
import GenericResource from '../../entities/GenericResource'

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
    movieTitle: 'abc',
    user_id: userId0,
    created_at: new Date('2025-07-10T08:00:00.763Z').getTime(),
    updated_at: 1752666420763,
    created_at_iso: '2025-07-10T08:00:00.763Z',
    updated_at_iso: '2025-07-16T11:47:00.763Z',
  },
  {
    id: uuidv4(),
    name: itemName0,
    director: 'Stanley Kubrick',
    age: 70,
    quality: 'excellent',
    birthday: '1928-07-26T00:00:00.000Z',
    movieTitle: '2001: A Space Odyssey',
    user_id: userId0,
    created_at: new Date('2025-07-11T08:00:00.763Z').getTime(),
    updated_at: 1752666420763,
    created_at_iso: '2025-07-11T08:00:00.763Z',
    updated_at_iso: '2025-07-16T11:47:00.763Z',
  },
  {
    id: uuidv4(),
    name: itemName0,
    director: 'Sofia Coppola',
    age: 50,
    quality: 'good',
    movieTitle: 'Virgin Suicide',
    birthday: '1971-05-14T00:00:00.000Z',
    user_id: userId0,
    created_at: new Date('2024-02-05T08:00:00.763Z').getTime(),
    updated_at: 1752666420763,
    created_at_iso: '2024-02-05T08:00:00.763Z',
    updated_at_iso: '2025-07-16T11:47:00.763Z',
  },
  {
    id: uuidv4(),
    name: itemName0,
    director: 'David Fincher',
    age: 60,
    quality: 'good',
    movieTitle: 'Fight Club',
    birthday: '1962-08-28T00:00:00.000Z',
    user_id: userId0,
    created_at: new Date('2025-03-04T08:00:00.763Z').getTime(),
    updated_at: 1752666420763,
    created_at_iso: '2025-03-04T08:00:00.763Z',
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
    created_at: new Date('2025-03-01T08:00:00.763Z').getTime(),
    updated_at: 1752666420763,
    created_at_iso: '2025-03-01T08:00:00.763Z',
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
    created_at: new Date('2025-02-02T08:00:00.763Z').getTime(),
    updated_at: 1752666420763,
    created_at_iso: '2025-02-02T08:00:00.763Z',
    updated_at_iso: '2025-07-16T11:47:00.763Z',
  },
  {
    id: uuid3,
    name: itemName1,
    content: {
      desc: 'test content 3',
      items: [],
    },
    created_at: new Date('2025-02-02T08:00:00.763Z').getTime(),
    updated_at: 1752666420763,
    created_at_iso: '2025-02-02T08:00:00.763Z',
    updated_at_iso: '2025-07-16T11:47:00.763Z',
  },
]

const sortArray = (
  items: ResourceType[],
  sortKey: string,
  sortDirection: 'asc' | 'desc',
) => {
  return items.sort((a, b) => {
    let aValue = a[sortKey]
    let bValue = b[sortKey]
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1
    }
    return 0
  })
}

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
  jest.clearAllMocks()
})

describe('routes', () => {
  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}`, () => {
    it(`get all ${itemName0} items without any order`, async () => {
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

  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}?_order=blabblabla.asc`, () => {
    it(`get no order change for ${itemName0} items based on non existing attribute`, async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}?_order=blabblabla.asc`,
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

  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}?_order=age.asc`, () => {
    it(`get ordered ${itemName0} items by age.asc`, async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}?_order=age.asc`,
      })
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)

      const expectedItemsRaw = sortArray(
        items.filter((i) => {
          return i.name === itemName0 && i.user_id === userId0
        }),
        'age',
        'asc',
      )

      const expectedItems = expectedItemsRaw.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_id, ...sanisanitizedItem } = item
        return sanisanitizedItem
      })

      expect(body.results).toEqual(expectedItems)
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}?_order=age.desc`, () => {
    it(`get ordered ${itemName0} items by age.desc`, async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}?_order=age.desc`,
      })
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)

      const expectedItemsRaw = sortArray(
        items.filter((i) => {
          return i.name === itemName0 && i.user_id === userId0
        }),
        'age',
        'desc',
      )

      const expectedItems = expectedItemsRaw.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_id, ...sanisanitizedItem } = item
        return sanisanitizedItem
      })

      expect(body.results).toEqual(expectedItems)
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}?_order=created_at_iso.asc`, () => {
    it(`get ordered ${itemName0} items by created_at_iso.asc`, async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}?_order=created_at_iso.asc`,
      })
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)

      const expectedItemsRaw = sortArray(
        items.filter((i) => {
          return i.name === itemName0 && i.user_id === userId0
        }),
        'created_at_iso',
        'asc',
      )

      const expectedItems = expectedItemsRaw.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_id, ...sanisanitizedItem } = item
        return sanisanitizedItem
      })

      expect(body.results).toEqual(expectedItems)
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}?_order=created_at_iso.desc`, () => {
    it(`get ordered ${itemName0} items by created_at_iso.asc`, async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}?_order=created_at_iso.desc`,
      })
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)

      const expectedItemsRaw = sortArray(
        items.filter((i) => {
          return i.name === itemName0 && i.user_id === userId0
        }),
        'created_at_iso',
        'desc',
      )

      const expectedItems = expectedItemsRaw.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_id, ...sanisanitizedItem } = item
        return sanisanitizedItem
      })

      expect(body.results).toEqual(expectedItems)
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/item/${itemName0}?_order=movieTitle.asc`, () => {
    it(`get ordered ${itemName0} items by movieTitle.asc`, async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/item/${itemName0}?_order=movieTitle.asc`,
      })
      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)

      const expectedItemsRaw = sortArray(
        items.filter((i) => {
          return i.name === itemName0 && i.user_id === userId0
        }),
        'movieTitle',
        'asc',
      )

      const expectedItems = expectedItemsRaw.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_id, ...sanisanitizedItem } = item
        return sanisanitizedItem
      })

      expect(body.results).toEqual(expectedItems)
    })
  })
})

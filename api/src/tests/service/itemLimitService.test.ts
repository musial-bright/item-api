import {
  expect,
  describe,
  it,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals'

import GenericResource from '../../entities/GenericResource'
import GenericResourceMock from '../__helpers__/GenericResourceMock'
import { ResourceAttributesType, ResourceType } from '../../entities/types'
import { IndexQueryCondition } from '../../utils/dynamoDbHelper'
import {
  countUserItems,
  getMaxItemsPerUser,
  assertUserCanCreateItem,
} from '../../service/itemLimitService'
import {
  GlobalConfigKey,
  DefaultGlobalConfig,
} from '../../service/globalConfigService'

jest.mock('../../config/envVariables', () => {
  const original = jest.requireActual<
    typeof import('../../config/envVariables')
  >('../../config/envVariables')

  return {
    ...original,
    envEnvironment: jest.fn().mockReturnValue('test'),
  }
})

const userId0 = 'user-0'
const userId1 = 'user-1'

const items: ResourceType[] = [
  { id: 'i0', name: 'some-item', user_id: userId0 },
  { id: 'i1', name: 'other-item', user_id: userId0 },
  { id: 'i2', name: 'another-item', user_id: userId1 },
]

let itemTableMock: GenericResourceMock
let serviceTableMock: GenericResourceMock

/**
 * `Item`/`MyItem`/the raw `item` lookup in `countUserItems` and
 * `ServiceEntity` are all `GenericResource` subclasses/instances backed by
 * *different* DynamoDB tables in production. `GenericResource.prototype` is
 * spied on once here for all of them, so the mock implementation dispatches
 * to the right table mock based on the calling instance's `tableName` (only
 * available via `this`, hence the `function` expressions below instead of
 * arrow functions).
 */
const setupMocks = ({
  serviceItems = [],
}: { serviceItems?: ResourceType[] } = {}) => {
  itemTableMock = new GenericResourceMock({
    tableNameSuffix: 'item',
    indexNameSuffix: 'by-user-id',
    items: [...items],
  })

  serviceTableMock = new GenericResourceMock({
    tableNameSuffix: 'service',
    indexNameSuffix: '',
    items: serviceItems,
  })

  const mockForInstance = (instance: GenericResource): GenericResourceMock => {
    if (instance.tableName === itemTableMock.table.tableName) {
      return itemTableMock
    }
    if (instance.tableName === serviceTableMock.table.tableName) {
      return serviceTableMock
    }

    throw new Error(`No table mock configured for "${instance.tableName}"`)
  }

  jest
    .spyOn(GenericResource.prototype, 'queryBy')
    .mockImplementation(async function (
      this: GenericResource,
      {
        indexNameSuffix,
        conditions,
        filterExpressions,
      }: {
        indexNameSuffix: string
        conditions: IndexQueryCondition[]
        filterExpressions?: unknown[]
      },
    ) {
      return mockForInstance(this).queryBy({
        indexNameSuffix,
        conditions,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filterExpressions: filterExpressions as any,
      })
    })

  jest
    .spyOn(GenericResource.prototype, 'get')
    .mockImplementation(async function (
      this: GenericResource,
      { keys }: { keys: ResourceAttributesType },
    ) {
      return mockForInstance(this).get({ keys })
    })
}

beforeEach(() => {
  setupMocks()
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('countUserItems', () => {
  it('counts only the items belonging to the given user', async () => {
    const count = await countUserItems({ userId: userId0, limit: 2000 })
    expect(count).toBe(2)
  })

  it('returns 0 for a user with no items', async () => {
    const count = await countUserItems({ userId: 'unknown-user', limit: 2000 })
    expect(count).toBe(0)
  })

  // GenericResourceMock always answers in a single page, so it can't
  // exercise pagination - these tests script `queryBy` directly to prove
  // `countUserItems` actually follows `continuation` across pages, rather
  // than counting the first page only.
  describe('pagination', () => {
    it('sums counts across multiple continuation pages', async () => {
      const queryBySpy = jest
        .spyOn(GenericResource.prototype, 'queryBy')
        .mockResolvedValueOnce({
          items: undefined,
          count: 900,
          continuation: 'page-2',
        })
        .mockResolvedValueOnce({
          items: undefined,
          count: 900,
          continuation: 'page-3',
        })
        .mockResolvedValueOnce({ items: undefined, count: 200 })

      const count = await countUserItems({ userId: userId0, limit: 2000 })

      expect(count).toBe(2000)
      expect(queryBySpy).toHaveBeenCalledTimes(3)
      expect(queryBySpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ continuation: 'page-2' }),
      )
      expect(queryBySpy).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({ continuation: 'page-3' }),
      )
    })

    it('stops requesting further pages as soon as the limit is reached, even if more pages exist', async () => {
      const queryBySpy = jest
        .spyOn(GenericResource.prototype, 'queryBy')
        .mockResolvedValueOnce({
          items: undefined,
          count: 2,
          continuation: 'page-2',
        })
        .mockResolvedValueOnce({
          items: undefined,
          count: 5,
          continuation: 'page-3',
        })

      const count = await countUserItems({ userId: userId0, limit: 5 })

      expect(count).toBe(7)
      // a 3rd page was available (continuation: 'page-3') but is irrelevant
      // once we already know the user is at/over the limit
      expect(queryBySpy).toHaveBeenCalledTimes(2)
    })

    it('does not stop early while still under the limit, even with many pages', async () => {
      const queryBySpy = jest
        .spyOn(GenericResource.prototype, 'queryBy')
        .mockResolvedValueOnce({
          items: undefined,
          count: 1,
          continuation: 'page-2',
        })
        .mockResolvedValueOnce({
          items: undefined,
          count: 1,
          continuation: 'page-3',
        })
        .mockResolvedValueOnce({ items: undefined, count: 1 })

      const count = await countUserItems({ userId: userId0, limit: 2000 })

      expect(count).toBe(3)
      expect(queryBySpy).toHaveBeenCalledTimes(3)
    })
  })
})

describe('getMaxItemsPerUser', () => {
  it('returns the default limit when no config override exists', async () => {
    const limit = await getMaxItemsPerUser()
    expect(limit).toBe(DefaultGlobalConfig.itemLimits.maxItemsPerUser)
  })

  it('returns the configured override when present', async () => {
    setupMocks({
      serviceItems: [
        { ...GlobalConfigKey, itemLimits: { maxItemsPerUser: 5 } },
      ],
    })

    const limit = await getMaxItemsPerUser()
    expect(limit).toBe(5)
  })
})

describe('assertUserCanCreateItem', () => {
  it('does not throw when the user is under the limit', async () => {
    await expect(
      assertUserCanCreateItem({ userId: userId0 }),
    ).resolves.toBeUndefined()
  })

  it('throws UnprocessableContentError when the user reached the limit', async () => {
    setupMocks({
      serviceItems: [
        { ...GlobalConfigKey, itemLimits: { maxItemsPerUser: 2 } },
      ],
    })

    await expect(
      assertUserCanCreateItem({ userId: userId0 }),
    ).rejects.toMatchObject({ statusCode: 422 })
  })

  it('does not throw for a different user under the same lowered limit', async () => {
    setupMocks({
      serviceItems: [
        { ...GlobalConfigKey, itemLimits: { maxItemsPerUser: 2 } },
      ],
    })

    await expect(
      assertUserCanCreateItem({ userId: userId1 }),
    ).resolves.toBeUndefined()
  })
})

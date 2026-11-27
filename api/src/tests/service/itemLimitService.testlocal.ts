import { expect, describe, it, jest, beforeAll, afterEach } from '@jest/globals'

import Item from '../../entities/Item'
import ServiceEntity from '../../entities/ServiceEntity'
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
    envDynamoDbEndpoint: jest.fn().mockReturnValue('http://localhost:8000'),
    envEnvironment: jest.fn().mockReturnValue('test'),
  }
})

const itemName = 'test-item-limit'
const item = new Item(itemName)
const service = new ServiceEntity()

const userWithItems = 'user-jest-item-limit-with-items'
const userWithoutItems = 'user-jest-item-limit-without-items'

const testAttrs = { test: 'itemLimitService.testlocal.ts' }

const cleanupItems = async () => {
  const result = await item.queryBy({
    indexNameSuffix: 'by-name',
    conditions: [{ attrName: 'name', attrValue: itemName, condition: '=' }],
  })

  for (const existingItem of result.items || []) {
    await item.delete({ keys: { id: existingItem.id } })
  }
}

const cleanupGlobalConfig = async () => {
  await service.delete({ keys: GlobalConfigKey })
}

beforeAll(async () => {
  await cleanupItems()
  await cleanupGlobalConfig()
})

afterEach(async () => {
  await cleanupItems()
  await cleanupGlobalConfig()
})

describe('countUserItems', () => {
  it('counts the real items created for a user via the item-by-user-id GSI', async () => {
    await item.create({
      attrs: { name: itemName, user_id: userWithItems, ...testAttrs },
    })
    await item.create({
      attrs: { name: itemName, user_id: userWithItems, ...testAttrs },
    })
    await item.create({
      attrs: { name: itemName, user_id: 'some-other-user', ...testAttrs },
    })

    const count = await countUserItems({ userId: userWithItems, limit: 2000 })

    expect(count).toBe(2)
  })

  it('returns 0 for a user with no items', async () => {
    const count = await countUserItems({
      userId: userWithoutItems,
      limit: 2000,
    })

    expect(count).toBe(0)
  })
})

describe('getMaxItemsPerUser', () => {
  it('returns the default limit when no override is stored', async () => {
    const limit = await getMaxItemsPerUser()

    expect(limit).toBe(DefaultGlobalConfig.itemLimits.maxItemsPerUser)
  })

  it('returns the override stored in the real service table', async () => {
    await service.create({
      attrs: { ...GlobalConfigKey, itemLimits: { maxItemsPerUser: 3 } },
    })

    const limit = await getMaxItemsPerUser()

    expect(limit).toBe(3)
  })
})

describe('assertUserCanCreateItem', () => {
  it('throws once the real item count reaches a lowered global limit', async () => {
    await service.create({
      attrs: { ...GlobalConfigKey, itemLimits: { maxItemsPerUser: 2 } },
    })
    await item.create({
      attrs: { name: itemName, user_id: userWithItems, ...testAttrs },
    })
    await item.create({
      attrs: { name: itemName, user_id: userWithItems, ...testAttrs },
    })

    await expect(
      assertUserCanCreateItem({ userId: userWithItems }),
    ).rejects.toMatchObject({ statusCode: 422 })
  })

  it('does not throw for a user under the lowered limit', async () => {
    await service.create({
      attrs: { ...GlobalConfigKey, itemLimits: { maxItemsPerUser: 2 } },
    })

    await expect(
      assertUserCanCreateItem({ userId: userWithoutItems }),
    ).resolves.toBeUndefined()
  })
})

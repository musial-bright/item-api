import { expect, describe, it, jest, afterEach, beforeAll } from '@jest/globals'

import MyItem from '../../entities/MyItem'
import { ResourceAttributesType } from '../../entities/types'

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

const user0 = 'user-jest'
const user1 = 'user-api-key'

const user0item0 = new MyItem(user0, 'test-item')
const user0item1 = new MyItem(user0, 'test-other-item')

const user1item1 = new MyItem(user1, 'test-other-item')

const notExistingItem = new MyItem(user0, 'test-item-not-existing')
const createItem = new MyItem(user0, 'test-item-create')

const user0item0attr0: ResourceAttributesType = {
  user_id: user0,
  name: user0item0.name,
  test: 'Item.testlocal.ts',
  director: 'Stanley Kubrick',
  age: 70,
  quality: 'excellent',
}

const user0item1attrs1: ResourceAttributesType = {
  user_id: user0,
  name: user0item1.name,
  test: 'Item.testlocal.ts',
  director: 'Sofia Coppola',
  age: 50,
  quality: 'good',
}

const user1item1attrs0: ResourceAttributesType = {
  user_id: user1,
  name: user1item1.name,
  test: 'Item.testlocal.ts',
  director: 'Alfred Hitchcock',
  age: 80,
  quality: 'excellent',
}

const cleanupDb = async (itemRef: MyItem) => {
  return await itemRef.delete()
}

const allItemAttrs = [
  user0item0,
  user0item1,
  user1item1,
  notExistingItem,
  createItem,
]

beforeAll(async () => {
  for (const itemRef of allItemAttrs) {
    await cleanupDb(itemRef)
  }
})

afterEach(async () => {
  for (const itemRef of allItemAttrs) {
    await cleanupDb(itemRef)
  }
})

describe('get', () => {
  beforeEach(async () => {
    const createdItems: ResourceAttributesType[] = []
    for (const attrRef of [user0item0attr0]) {
      const createdItem = await user0item0.create({ attrs: attrRef })
      createdItems.push(createdItem)
    }

    for (const attrRef of [user0item1attrs1]) {
      const createdItem = await user0item1.create({ attrs: attrRef })
      createdItems.push(createdItem)
    }

    for (const attrRef of [user1item1attrs0]) {
      const createdItem = await user1item1.create({ attrs: attrRef })
      createdItems.push(createdItem)
    }
  })

  it('has no item', async () => {
    const getItem = await notExistingItem.get()

    expect(getItem).toEqual(undefined)
  })

  it('has item', async () => {
    const getItem = (await user0item0.get()) as ResourceAttributesType

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      id,
      created_at,
      updated_at,
      created_at_iso,
      updated_at_iso,
      ...expectedItemAttrs
    } = getItem
    /* eslint-enable @typescript-eslint/no-unused-vars */
    expect(expectedItemAttrs).toEqual(expectedItemAttrs)

    // expect(getItem).toEqual(user0item0attr0)
  })
})

describe('create', () => {
  it('has new item', async () => {
    const notExistingItemGetResult = await createItem.get()

    expect(notExistingItemGetResult).toEqual(undefined)

    const newAttrs = {
      ...user0item0attr0,
      notExistingItem: 'now existing',
      name: 'test-item-create',
    }
    const createdItem = await createItem.create({
      attrs: newAttrs,
    })

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      id,
      created_at,
      updated_at,
      created_at_iso,
      updated_at_iso,
      ...expectedItemAttrs
    } = createdItem
    /* eslint-enable @typescript-eslint/no-unused-vars */
    expect(expectedItemAttrs).toEqual(newAttrs)

    const getItem = await createItem.get()

    expect(getItem).toEqual(createdItem)
  })
})

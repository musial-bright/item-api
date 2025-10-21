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

const user0 = 'user-jest-my-item'
const user1 = 'user-api-key-my-item'

const user0item0 = new MyItem(user0, 'test-my-item')
const user0item1 = new MyItem(user0, 'test-other-my-item')

const user1item1 = new MyItem(user1, 'test-other-my-item')

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

afterEach(async () => {
  for (const itemRef of allItemAttrs) {
    await cleanupDb(itemRef)
  }
})

describe('get', () => {
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

  it('has no changes on already existing item', async () => {
    const existingItem = (await user0item0.get()) as ResourceAttributesType

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      id,
      created_at,
      updated_at,
      created_at_iso,
      updated_at_iso,
      ...expectedItemAttrs
    } = existingItem
    /* eslint-enable @typescript-eslint/no-unused-vars */
    expect(expectedItemAttrs).toEqual(user0item0attr0)

    const createExistingItem = await user0item0.create({
      attrs: {
        newAttr: 'this is a new attribute',
      },
    })

    expect(createExistingItem).toEqual(createExistingItem)
    expect(createExistingItem.updated_at).toEqual(createExistingItem.updated_at)
    expect(createExistingItem.updated_at_iso).toEqual(
      createExistingItem.updated_at_iso,
    )
  })
})

describe('update', () => {
  it('has not update on an not existing item', async () => {
    const notExistingItemUpdateResult = await notExistingItem.update({
      attrs: {
        newAttr: 'new attribute',
      },
    })

    expect(notExistingItemUpdateResult).toEqual(undefined)
  })

  it('has updated item', async () => {
    const existingItem = (await user0item0.get()) as ResourceAttributesType

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      id,
      created_at,
      updated_at,
      created_at_iso,
      updated_at_iso,
      ...expectedItemAttrs
    } = existingItem
    /* eslint-enable @typescript-eslint/no-unused-vars */
    expect(expectedItemAttrs).toEqual(user0item0attr0)

    const newAttribute = {
      newAttr: 'a new attribute',
    }

    const updatedItem = (await user0item0.update({
      attrs: newAttribute,
    })) as ResourceAttributesType
    expect(updatedItem.newAttr).toEqual(newAttribute.newAttr)
    expect(updatedItem.updated_at > existingItem.updated_at).toBeTruthy()
  })
})

describe('delete', () => {
  it('has false on an not existing item', async () => {
    const notExistingItemDeleteResult = await notExistingItem.delete()

    expect(notExistingItemDeleteResult).toBeFalsy()
  })

  it('has true on an existing item', async () => {
    const itemDeleteResult = await user0item0.delete()

    expect(itemDeleteResult).toBeTruthy()
  })
})

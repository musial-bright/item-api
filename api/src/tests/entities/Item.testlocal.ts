import { expect, describe, it, jest, afterEach, beforeAll } from '@jest/globals'

import Item from '../../entities/Item'
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

const item0 = new Item('test-item')
const item1 = new Item('test-other-item')
const user0 = 'jest'
const user1 = 'api-key'

const attrs0: ResourceAttributesType = {
  name: item0.name,
  user_id: user0,
  test: 'Item.testlocal.ts',
  data: { director: 'Stanley Kubrick' },
}
const attrs1: ResourceAttributesType = {
  name: item0.name,
  user_id: user0,
  test: 'Item.testlocal.ts',
  data: { director: 'Sofia Coppola' },
}
const attrs2: ResourceAttributesType = {
  name: item1.name,
  user_id: user0,
  test: 'Item.testlocal.ts',
  data: { director: 'Steven Spielberg' },
}
const attrs3: ResourceAttributesType = {
  name: item1.name,
  user_id: user1,
  test: 'Item.testlocal.ts',
  data: { director: 'Alfred Hitchcock' },
}

const cleanupDb = async (itemRef: Item) => {
  const testItems = await itemRef.queryBy({
    indexNameSuffix: 'by-name',
    conditions: [
      {
        attrName: 'name',
        attrValue: itemRef.name,
        condition: '=',
      },
    ],
  })

  if (testItems) {
    for (const testItem of testItems) {
      await itemRef.delete({ keys: { id: testItem.id } })
    }
  }
}

beforeAll(async () => {
  for (const itemRef of [item0, item1]) {
    await cleanupDb(itemRef)
  }
})

afterEach(async () => {
  for (const itemRef of [item0, item1]) {
    await cleanupDb(itemRef)
  }
})

describe('queryBy', () => {
  beforeEach(async () => {
    const createdItems0: ResourceAttributesType[] = []
    for (const attrRef of [attrs0, attrs1]) {
      const createdItem = await item0.create({ attrs: attrRef })
      createdItems0.push(createdItem)
    }

    const createdItems1: ResourceAttributesType[] = []
    for (const attrRef of [attrs2, attrs3]) {
      const createdItem = await item1.create({ attrs: attrRef })
      createdItems1.push(createdItem)
    }
  })

  describe('name', () => {
    it(`has items of name '${item0.name}'`, async () => {
      const getItems0ByName = await item0.queryBy({
        indexNameSuffix: 'by-name',
        conditions: [
          {
            attrName: 'name',
            attrValue: item0.name,
            condition: '=',
          },
        ],
      })
      const getItems0ByNameWithoutId = getItems0ByName?.map((item) => {
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        const { id, ...attrs } = item
        return attrs
      })

      expect(getItems0ByName).not.toBe(undefined)
      expect(getItems0ByName!.length).toEqual(2)
      expect(getItems0ByNameWithoutId).not.toBe(undefined)
      expect(getItems0ByNameWithoutId!.length).toEqual(2)
      expect(
        getItems0ByNameWithoutId!.filter(
          (i) => i.data.director === attrs0.data.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByNameWithoutId!.filter(
          (i) => i.data.director === attrs1.data.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByNameWithoutId!.filter(
          (i) => i.data.director === attrs2.data.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems0ByNameWithoutId!.filter(
          (i) => i.data.director === attrs3.data.director,
        ).length,
      ).toEqual(0)
    })

    it(`has items of name '${item1.name}'`, async () => {
      const getItems1ByName = await item1.queryBy({
        indexNameSuffix: 'by-name',
        conditions: [
          {
            attrName: 'name',
            attrValue: item1.name,
            condition: '=',
          },
        ],
      })
      const getItems1ByNameWithoutId = getItems1ByName?.map((item) => {
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        const { id, ...attrs } = item
        return attrs
      })

      expect(getItems1ByName).not.toBe(undefined)
      expect(getItems1ByName!.length).toEqual(2)
      expect(getItems1ByNameWithoutId).not.toBe(undefined)
      expect(getItems1ByNameWithoutId!.length).toEqual(2)
      expect(
        getItems1ByNameWithoutId!.filter(
          (i) => i.data.director === attrs0.data.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByNameWithoutId!.filter(
          (i) => i.data.director === attrs1.data.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByNameWithoutId!.filter(
          (i) => i.data.director === attrs2.data.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems1ByNameWithoutId!.filter(
          (i) => i.data.director === attrs3.data.director,
        ).length,
      ).toEqual(1)
    })
  })

  describe('user_id', () => {
    it(`has user '${user0}' items'`, async () => {
      const getItems0ByUser0AndName = await item0.queryBy({
        indexNameSuffix: 'by-user-id',
        conditions: [
          {
            attrName: 'user_id',
            attrValue: user0,
            condition: '=',
          },
        ],
      })

      const getItems0ByUser0AndNameWithoutId = getItems0ByUser0AndName?.map(
        (item) => {
          // eslint-disable-next-line  @typescript-eslint/no-unused-vars
          const { id, ...attrs } = item
          return attrs
        },
      )

      expect(getItems0ByUser0AndName).not.toBe(undefined)
      expect(getItems0ByUser0AndName!.length).toEqual(3)
      expect(getItems0ByUser0AndNameWithoutId).not.toBe(undefined)
      expect(getItems0ByUser0AndNameWithoutId!.length).toEqual(3)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.data.director === attrs0.data.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.data.director === attrs1.data.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.data.director === attrs2.data.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.data.director === attrs3.data.director,
        ).length,
      ).toEqual(0)
    })

    it(`has user '${user1}' items of name '${item1.name}'`, async () => {
      const getItems1ByUser1AndName = await item1.queryBy({
        indexNameSuffix: 'by-user-id',
        conditions: [
          {
            attrName: 'user_id',
            attrValue: user1,
            condition: '=',
          },
        ],
      })
      const getItems1ByUser1AndNameWithoutId = getItems1ByUser1AndName?.map(
        (item) => {
          // eslint-disable-next-line  @typescript-eslint/no-unused-vars
          const { id, ...attrs } = item
          return attrs
        },
      )

      expect(getItems1ByUser1AndName).not.toBe(undefined)
      expect(getItems1ByUser1AndName!.length).toEqual(1)
      expect(getItems1ByUser1AndNameWithoutId).not.toBe(undefined)
      expect(getItems1ByUser1AndNameWithoutId!.length).toEqual(1)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.data.director === attrs0.data.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.data.director === attrs1.data.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.data.director === attrs2.data.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.data.director === attrs3.data.director,
        ).length,
      ).toEqual(1)
    })
  })

  describe('user_id and name', () => {
    it(`has user '${user0}' items of name '${item0.name}'`, async () => {
      const getItems0ByUser0AndName = await item0.queryBy({
        indexNameSuffix: 'by-user-id-and-name',
        conditions: [
          {
            attrName: 'user_id',
            attrValue: user0,
            condition: '=',
          },
          {
            attrName: 'name',
            attrValue: item0.name,
            condition: '=',
          },
        ],
      })

      const getItems0ByUser0AndNameWithoutId = getItems0ByUser0AndName?.map(
        (item) => {
          // eslint-disable-next-line  @typescript-eslint/no-unused-vars
          const { id, ...attrs } = item
          return attrs
        },
      )

      expect(getItems0ByUser0AndName).not.toBe(undefined)
      expect(getItems0ByUser0AndName!.length).toEqual(2)
      expect(getItems0ByUser0AndNameWithoutId).not.toBe(undefined)
      expect(getItems0ByUser0AndNameWithoutId!.length).toEqual(2)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.data.director === attrs0.data.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.data.director === attrs1.data.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.data.director === attrs2.data.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.data.director === attrs3.data.director,
        ).length,
      ).toEqual(0)
    })

    it(`has user '${user1}' items of name '${item1.name}'`, async () => {
      const getItems1ByUser1AndName = await item1.queryBy({
        indexNameSuffix: 'by-user-id-and-name',
        conditions: [
          {
            attrName: 'user_id',
            attrValue: user1,
            condition: '=',
          },
          {
            attrName: 'name',
            attrValue: item1.name,
            condition: '=',
          },
        ],
      })
      const getItems1ByUser1AndNameWithoutId = getItems1ByUser1AndName?.map(
        (item) => {
          // eslint-disable-next-line  @typescript-eslint/no-unused-vars
          const { id, ...attrs } = item
          return attrs
        },
      )

      expect(getItems1ByUser1AndName).not.toBe(undefined)
      expect(getItems1ByUser1AndName!.length).toEqual(1)
      expect(getItems1ByUser1AndNameWithoutId).not.toBe(undefined)
      expect(getItems1ByUser1AndNameWithoutId!.length).toEqual(1)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.data.director === attrs0.data.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.data.director === attrs1.data.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.data.director === attrs2.data.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.data.director === attrs3.data.director,
        ).length,
      ).toEqual(1)
    })
  })
})

describe('get', () => {
  it('has item', async () => {
    const createdItem = await item0.create({ attrs: attrs0 })

    const { id, ...expectedItemAttrs } = createdItem
    expect(expectedItemAttrs).toEqual(attrs0)

    const getItem = await item0.get({ keys: { id } })
    expect(createdItem).toEqual(getItem)
  })
})

describe('create', () => {
  it('has new item', async () => {
    const createdItem = await item0.create({ attrs: attrs0 })

    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    const { id, ...expectedItemAttrs } = createdItem

    expect(expectedItemAttrs).toEqual(attrs0)
  })
})

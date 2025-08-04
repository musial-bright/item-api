import { expect, describe, it, jest, afterEach, beforeAll } from '@jest/globals'

import Item from '../../entities/Item'
import { ResourceAttributesType } from '../../entities/types'
import { IndexQueryCondition } from '../../utils/dynamoDbHelper'

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
const user0 = 'user-jest'
const user1 = 'user-api-key'

const attrs0: ResourceAttributesType = {
  name: item0.name,
  user_id: user0,
  test: 'Item.testlocal.ts',
  director: 'Stanley Kubrick',
  age: 70,
  quality: 'excellent',
}
const attrs1: ResourceAttributesType = {
  name: item0.name,
  user_id: user0,
  test: 'Item.testlocal.ts',
  director: 'Sofia Coppola',
  age: 50,
  quality: 'good',
}
const attrs4: ResourceAttributesType = {
  name: item0.name,
  user_id: user0,
  test: 'Item.testlocal.ts',
  director: 'David Fincher',
  age: 60,
  quality: 'good',
}

const attrs2: ResourceAttributesType = {
  name: item1.name,
  user_id: user0,
  test: 'Item.testlocal.ts',
  director: 'Steven Spielberg',
  age: 75,
  quality: 'excellent',
}

const attrs3: ResourceAttributesType = {
  name: item1.name,
  user_id: user1,
  test: 'Item.testlocal.ts',
  director: 'Alfred Hitchcock',
  age: 80,
  quality: 'excellent',
}

const cleanupDb = async (itemRef: Item) => {
  const testResult = await itemRef.queryBy({
    indexNameSuffix: 'by-name',
    conditions: [
      {
        attrName: 'name',
        attrValue: itemRef.name,
        condition: '=',
      },
    ],
  })

  if (testResult) {
    for (const testItem of testResult.items || []) {
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
    for (const attrRef of [attrs0, attrs1, attrs4]) {
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
      const getItems0ByNameWithoutId = getItems0ByName?.items?.map((item) => {
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        const { id, created_at, updated_at, ...attrs } = item
        return attrs
      })

      expect(getItems0ByName).not.toBe(undefined)
      expect(getItems0ByName!.items?.length).toEqual(3)
      expect(getItems0ByNameWithoutId).not.toBe(undefined)
      expect(getItems0ByNameWithoutId!.length).toEqual(3)
      expect(
        getItems0ByNameWithoutId!.filter((i) => i.director === attrs0.director)
          .length,
      ).toEqual(1)
      expect(
        getItems0ByNameWithoutId!.filter((i) => i.director === attrs1.director)
          .length,
      ).toEqual(1)
      expect(
        getItems0ByNameWithoutId!.filter((i) => i.director === attrs2.director)
          .length,
      ).toEqual(0)
      expect(
        getItems0ByNameWithoutId!.filter((i) => i.director === attrs3.director)
          .length,
      ).toEqual(0)
      expect(
        getItems0ByNameWithoutId!.filter((i) => i.director === attrs4.director)
          .length,
      ).toEqual(1)
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
      const getItems1ByNameWithoutId = getItems1ByName?.items?.map((item) => {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const {
          id,
          created_at,
          updated_at,
          created_at_iso,
          updated_at_iso,
          ...attrs
        } = item
        /* eslint-enable  @typescript-eslint/no-unused-vars */
        return attrs
      })

      expect(getItems1ByName).not.toBe(undefined)
      expect(getItems1ByName!.items?.length).toEqual(2)
      expect(getItems1ByNameWithoutId).not.toBe(undefined)
      expect(getItems1ByNameWithoutId!.length).toEqual(2)
      expect(
        getItems1ByNameWithoutId!.filter((i) => i.director === attrs0.director)
          .length,
      ).toEqual(0)
      expect(
        getItems1ByNameWithoutId!.filter((i) => i.director === attrs1.director)
          .length,
      ).toEqual(0)
      expect(
        getItems1ByNameWithoutId!.filter((i) => i.director === attrs2.director)
          .length,
      ).toEqual(1)
      expect(
        getItems1ByNameWithoutId!.filter((i) => i.director === attrs3.director)
          .length,
      ).toEqual(1)
      expect(
        getItems1ByNameWithoutId!.filter((i) => i.director === attrs4.director)
          .length,
      ).toEqual(0)
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

      const getItems0ByUser0AndNameWithoutId =
        getItems0ByUser0AndName?.items?.map((item) => {
          /* eslint-disable @typescript-eslint/no-unused-vars */
          const {
            id,
            created_at,
            updated_at,
            created_at_iso,
            updated_at_iso,
            ...attrs
          } = item
          /* eslint-enable @typescript-eslint/no-unused-vars */
          return attrs
        })

      expect(getItems0ByUser0AndName).not.toBe(undefined)
      expect(getItems0ByUser0AndName!.items?.length).toEqual(4)
      expect(getItems0ByUser0AndNameWithoutId).not.toBe(undefined)
      expect(getItems0ByUser0AndNameWithoutId!.length).toEqual(4)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.director === attrs0.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.director === attrs1.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.director === attrs2.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.director === attrs3.director,
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
      const getItems1ByUser1AndNameWithoutId =
        getItems1ByUser1AndName?.items?.map((item) => {
          /* eslint-disable @typescript-eslint/no-unused-vars */
          const {
            id,
            created_at,
            updated_at,
            created_at_iso,
            updated_at_iso,
            ...attrs
          } = item
          /* eslint-enable @typescript-eslint/no-unused-vars */
          return attrs
        })

      expect(getItems1ByUser1AndName).not.toBe(undefined)
      expect(getItems1ByUser1AndName!.items?.length).toEqual(1)
      expect(getItems1ByUser1AndNameWithoutId).not.toBe(undefined)
      expect(getItems1ByUser1AndNameWithoutId!.length).toEqual(1)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.director === attrs0.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.director === attrs1.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.director === attrs2.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.director === attrs3.director,
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

      const getItems0ByUser0AndNameWithoutId =
        getItems0ByUser0AndName?.items?.map((item) => {
          /* eslint-disable @typescript-eslint/no-unused-vars */
          const {
            id,
            created_at,
            updated_at,
            created_at_iso,
            updated_at_iso,
            ...attrs
          } = item
          /* eslint-enable @typescript-eslint/no-unused-vars */
          return attrs
        })

      expect(getItems0ByUser0AndName).not.toBe(undefined)
      expect(getItems0ByUser0AndName!.items?.length).toEqual(3)
      expect(getItems0ByUser0AndNameWithoutId).not.toBe(undefined)
      expect(getItems0ByUser0AndNameWithoutId!.length).toEqual(3)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.director === attrs0.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.director === attrs1.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.director === attrs4.director,
        ).length,
      ).toEqual(1)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.director === attrs2.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.director === attrs3.director,
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
      const getItems1ByUser1AndNameWithoutId =
        getItems1ByUser1AndName?.items?.map((item) => {
          /* eslint-disable @typescript-eslint/no-unused-vars */
          const {
            id,
            created_at,
            updated_at,
            created_at_iso,
            updated_at_iso,
            ...attrs
          } = item
          /* eslint-enable @typescript-eslint/no-unused-vars */
          return attrs
        })

      expect(getItems1ByUser1AndName).not.toBe(undefined)
      expect(getItems1ByUser1AndName!.items?.length).toEqual(1)
      expect(getItems1ByUser1AndNameWithoutId).not.toBe(undefined)
      expect(getItems1ByUser1AndNameWithoutId!.length).toEqual(1)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.director === attrs0.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.director === attrs1.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.director === attrs4.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.director === attrs2.director,
        ).length,
      ).toEqual(0)
      expect(
        getItems1ByUser1AndNameWithoutId!.filter(
          (i) => i.director === attrs3.director,
        ).length,
      ).toEqual(1)
    })
  })

  describe('user_id and name and limit', () => {
    it(`has user '${user0}' items of name '${item0.name}' with continuation in results`, async () => {
      const conditions: IndexQueryCondition[] = [
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
      ]
      const limit = 2
      const getItems0ByUser0AndName = await item0.queryBy({
        indexNameSuffix: 'by-user-id-and-name',
        conditions,
        limitUseWithCaution: limit,
      })

      const getItems0ByUser0AndNameWithoutId =
        getItems0ByUser0AndName?.items?.map((item) => {
          /* eslint-disable @typescript-eslint/no-unused-vars */
          const {
            id,
            created_at,
            updated_at,
            created_at_iso,
            updated_at_iso,
            ...attrs
          } = item
          /* eslint-enable @typescript-eslint/no-unused-vars */
          return attrs
        })

      const expectedContinuationStart =
        '{"name":"test-item","user_id":"user-jest"'

      expect(getItems0ByUser0AndName).not.toBe(undefined)
      expect(
        getItems0ByUser0AndName.continuation?.startsWith(
          expectedContinuationStart,
        ),
      ).toBeTruthy()
      expect(getItems0ByUser0AndName!.items?.length).toEqual(limit)
      expect(getItems0ByUser0AndNameWithoutId).not.toBe(undefined)
      expect(getItems0ByUser0AndNameWithoutId!.length).toEqual(limit)
      expect(
        getItems0ByUser0AndNameWithoutId!.filter(
          (i) => i.user_id === user0 && i.name === item0.name,
        ).length,
      ).toEqual(2)

      // test continuation
      const getItems0ByUser0AndNameWithContinuation = await item0.queryBy({
        indexNameSuffix: 'by-user-id-and-name',
        conditions,
        limitUseWithCaution: limit,
        continuation: getItems0ByUser0AndName.continuation,
      })

      expect(getItems0ByUser0AndNameWithContinuation).not.toBe(undefined)
      expect(getItems0ByUser0AndNameWithContinuation.continuation).toEqual(
        undefined,
      )
      expect(getItems0ByUser0AndNameWithContinuation!.items?.length).toEqual(1)

      expect(
        getItems0ByUser0AndNameWithContinuation!.items?.filter(
          (i) => i.user_id === user0 && i.name === item0.name,
        ).length,
      ).toEqual(1)
    })
  })
})

describe.only('get', () => {
  it('has no item', async () => {
    const getItem = await item0.get({ keys: { id: 'not-existing-id' } })

    expect(getItem).toEqual(123)
  })

  it('has item', async () => {
    const createdItem = await item0.create({ attrs: attrs0 })

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
    expect(expectedItemAttrs).toEqual(attrs0)

    const getItem = await item0.get({ keys: { id } })
    expect(createdItem).toEqual(getItem)
  })
})

describe('create', () => {
  it('has new item', async () => {
    const createdItem = await item0.create({ attrs: attrs0 })

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

    expect(expectedItemAttrs).toEqual(attrs0)
  })
})

describe('update', () => {
  it('has updated item', async () => {
    const createdItem = await item0.create({ attrs: attrs0 })

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
    expect(expectedItemAttrs).toEqual(attrs0)

    const updateItem = await item0.update({
      keys: { id },
      attrs: {
        ...attrs0,
        additionalData: 'some new data',
      },
    })

    const expectedUpdateItem = {
      ...expectedItemAttrs,
      additionalData: 'some new data',
    }

    expect({
      name: updateItem?.name,
      user_id: updateItem?.user_id,
      test: updateItem?.test,
      director: updateItem?.director,
      age: updateItem?.age,
      quality: updateItem?.quality,
      additionalData: updateItem?.additionalData,
    }).toEqual(expectedUpdateItem)

    const reloadedItem = await item0.get({ keys: { id } })
    expect({
      name: reloadedItem?.name,
      user_id: reloadedItem?.user_id,
      test: reloadedItem?.test,
      director: reloadedItem?.director,
      age: reloadedItem?.age,
      quality: reloadedItem?.quality,
      additionalData: reloadedItem?.additionalData,
    }).toEqual(expectedUpdateItem)
  })

  describe('with illegal name change', () => {
    it('has updated item without changing the name', async () => {
      const createdItem = await item0.create({ attrs: attrs0 })

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
      expect(expectedItemAttrs).toEqual(attrs0)

      const updateItem = await item0.update({
        keys: { id },
        attrs: {
          ...attrs0,
          additionalData: 'some new data',
          name: 'changed-name',
        },
      })
      const expectedUpdateItem = {
        ...expectedItemAttrs,
        additionalData: 'some new data',
        name: item0.name,
      }

      expect({
        name: updateItem?.name,
        user_id: updateItem?.user_id,
        test: updateItem?.test,
        director: updateItem?.director,
        age: updateItem?.age,
        quality: updateItem?.quality,
        additionalData: updateItem?.additionalData,
      }).toEqual(expectedUpdateItem)

      const reloadedItem = await item0.get({ keys: { id } })
      expect({
        name: reloadedItem?.name,
        user_id: reloadedItem?.user_id,
        test: reloadedItem?.test,
        director: reloadedItem?.director,
        age: reloadedItem?.age,
        quality: reloadedItem?.quality,
        additionalData: reloadedItem?.additionalData,
      }).toEqual(expectedUpdateItem)
    })
  })
})

describe('delete', () => {
  it('has deleted item', async () => {
    const createdItem = await item0.create({ attrs: attrs0 })

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

    expect(expectedItemAttrs).toEqual(attrs0)

    const deletedItem = await item0.delete({ keys: { id } })

    expect(deletedItem).toEqual(true)

    const reloadedItem = await item0.get({ keys: { id } })
    expect(reloadedItem).toEqual(undefined)
  })
})

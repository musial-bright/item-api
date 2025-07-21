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

const item0 = new Item('test-item-filter')
const item1 = new Item('test-other-item-filter')
const user0 = 'user-jest-filter'
const user1 = 'user-api-key-filer'

const attrs0: ResourceAttributesType = {
  name: item0.name,
  user_id: user0,
  test: 'Item.testlocal.ts',
  director: 'Stanley Kubrick',
  age: 70,
  quality: 'excellent',
  birthday: '1928-07-26T00:00:00.000Z',
}
const attrs1: ResourceAttributesType = {
  name: item0.name,
  user_id: user0,
  test: 'Item.testlocal.ts',
  director: 'Sofia Coppola',
  age: 50,
  quality: 'good',
  birthday: '1971-05-14T00:00:00.000Z',
}
const attrs4: ResourceAttributesType = {
  name: item0.name,
  user_id: user0,
  test: 'Item.testlocal.ts',
  director: 'David Fincher',
  age: 60,
  quality: 'good',
  birthday: '1962-08-28T00:00:00.000Z',
}

const attrs2: ResourceAttributesType = {
  name: item1.name,
  user_id: user0,
  test: 'Item.testlocal.ts',
  director: 'Steven Spielberg',
  age: 75,
  quality: 'excellent',
  birthday: '1946-12-18T00:00:00.000Z',
}

const attrs3: ResourceAttributesType = {
  name: item1.name,
  user_id: user1,
  test: 'Item.testlocal.ts',
  director: 'Alfred Hitchcock',
  age: 80,
  quality: 'excellent',
  birthday: '1899-08-13T00:00:00.000Z',
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
    for (const testItem of testItems.items || []) {
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

describe('queryBy with filter', () => {
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

  it(`has empty results on non existing filtered attribute'`, async () => {
    const filteredItems = await item0.queryBy({
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
      filterExpressions: [
        {
          attrName: 'blablabla',
          attrValue: 'awesome',
          condition: '=',
        },
      ],
    })

    expect(filteredItems).not.toBe(undefined)
    expect(filteredItems!.items?.length).toEqual(0)
  })

  it(`has age > 50'`, async () => {
    const filteredItems = await item0.queryBy({
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
      filterExpressions: [
        {
          attrName: 'age',
          attrValue: 50,
          condition: '>',
        },
      ],
    })

    expect(filteredItems).not.toBe(undefined)
    expect(filteredItems!.items?.length).toEqual(2)
    expect(filteredItems!.items?.filter((i) => i.age > 50).length).toEqual(2)
  })

  it(`has age > 50 and age < 70'`, async () => {
    const filteredItems = await item0.queryBy({
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
      filterExpressions: [
        {
          attrName: 'age',
          attrValue: 50,
          condition: '>',
        },
        {
          attrName: 'age',
          attrValue: 70,
          condition: '<',
        },
      ],
    })

    expect(filteredItems).not.toBe(undefined)
    expect(filteredItems!.items?.length).toEqual(1)
    expect(filteredItems!.items?.filter((i) => i.age === 60).length).toEqual(1)
  })

  it(`has Stanley Kubrick'`, async () => {
    const filteredItems = await item0.queryBy({
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
      filterExpressions: [
        {
          attrName: 'director',
          attrValue: 'Stanley Kubrick',
          condition: '=',
        },
      ],
    })

    expect(filteredItems).not.toBe(undefined)
    expect(filteredItems!.items?.length).toEqual(1)
    expect(
      filteredItems!.items?.filter((i) => i.director === 'Stanley Kubrick')
        .length,
    ).toEqual(1)
  })

  it(`has quality = good'`, async () => {
    const filteredItems = await item0.queryBy({
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
      filterExpressions: [
        {
          attrName: 'quality',
          attrValue: 'good',
          condition: '=',
        },
      ],
    })

    expect(filteredItems).not.toBe(undefined)
    expect(filteredItems!.items?.length).toEqual(2)
    expect(
      filteredItems!.items?.filter((i) => i.quality === 'good').length,
    ).toEqual(2)
  })

  it(`has a birthday after 1960'`, async () => {
    const filteredItems = await item0.queryBy({
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
      filterExpressions: [
        {
          attrName: 'birthday',
          attrValue: '1960-01-01T00:00:00.000Z',
          condition: '>',
        },
      ],
    })

    expect(filteredItems).not.toBe(undefined)
    expect(filteredItems!.items?.length).toEqual(2)
    expect(
      filteredItems!.items?.filter(
        (i) => i.birthday === '1962-08-28T00:00:00.000Z',
      ).length,
    ).toEqual(1)
    expect(
      filteredItems!.items?.filter(
        (i) => i.birthday === '1971-05-14T00:00:00.000Z',
      ).length,
    ).toEqual(1)
  })

  it(`has a birthday between 1962 and 1963'`, async () => {
    const filteredItems = await item0.queryBy({
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
      filterExpressions: [
        {
          attrName: 'birthday',
          attrValue: '1962-01-01T00:00:00.000Z',
          condition: '>',
        },
        {
          attrName: 'birthday',
          attrValue: '1963-01-01T00:00:00.000Z',
          condition: '<',
        },
      ],
    })

    expect(filteredItems).not.toBe(undefined)
    expect(filteredItems!.items?.length).toEqual(1)
    expect(
      filteredItems!.items?.filter(
        (i) => i.birthday === '1962-08-28T00:00:00.000Z',
      ).length,
    ).toEqual(1)
  })
})

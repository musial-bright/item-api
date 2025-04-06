import { expect, describe, it } from '@jest/globals'
import { createQuery, CreateQueryInterface, IndexQueryCondition } from '../../utils/dynamoDbHelper'


const queryBase: CreateQueryInterface = {
  tableName: 'item',
  indexNameSuffix: 'by-user-id-and-name',
  conditions: [],
}

const attrName0 = 'user_id'
const attrValue0 = 'some-user-id'
const attrName1 = 'name'
const attrValue1 = 'item'
const conditions: IndexQueryCondition[] = [
  {
    attrName: attrName0,
    attrValue: attrValue0,
    condition: '=',
  },
  {
    attrName: attrName1,
    attrValue: attrValue1,
    condition: '=',
  },
  {
    attrName: 'extra-condition-name',
    attrValue: 'extra-condition-value',
    condition: '=',
  },
]
    

describe('createQuery()', () => {
  it('has empty conditions', () => {
    const query: CreateQueryInterface = { ...queryBase }

    const expectedQuery = {
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
      IndexName: 'item-by-user-id-and-name',
      KeyConditionExpression: '',
      TableName: 'item',
    }

    expect(createQuery(query)).toEqual(expectedQuery)
  })
  
  it('has one condition', () => {
    const query: CreateQueryInterface = {
      ...queryBase,
      conditions: conditions.slice(0, 1),
    }

    const expectedQuery = {
      TableName: 'item',
      IndexName: 'item-by-user-id-and-name',
      KeyConditionExpression: '#attrName0 = :attrValue0',
      ExpressionAttributeNames: {
        '#attrName0': attrName0,
      },
      ExpressionAttributeValues: {
        ':attrValue0': attrValue0,
      },
    }

    expect(createQuery(query)).toEqual(expectedQuery)
  })

  it('has two conditions', () => {
    const query: CreateQueryInterface = {
      ...queryBase,
      conditions: conditions.slice(0, 2)
    }

    const expectedQuery = {
      TableName: 'item',
      IndexName: 'item-by-user-id-and-name',
      KeyConditionExpression: '#attrName0 = :attrValue0 and #attrName1 = :attrValue1',
      ExpressionAttributeNames: {
        '#attrName0': attrName0,
        '#attrName1': attrName1,
      },
      ExpressionAttributeValues: {
        ':attrValue0': attrValue0,
        ':attrValue1': attrValue1,
      },
    }

    expect(createQuery(query)).toEqual(expectedQuery)
  })

  it('has too many conditions with usage od 2 max', () => {
    const attrName0 = 'user_id'
    const attrValue0 = 'some-user-id'
    const query: CreateQueryInterface = {
      ...queryBase,
      conditions: conditions
    }

    const expectedQuery = {
      TableName: 'item',
      IndexName: 'item-by-user-id-and-name',
      KeyConditionExpression: '#attrName0 = :attrValue0 and #attrName1 = :attrValue1',
      ExpressionAttributeNames: {
        '#attrName0': attrName0,
        '#attrName1': attrName1,
      },
      ExpressionAttributeValues: {
        ':attrValue0': attrValue0,
        ':attrValue1': attrValue1,
      },
    }

    expect(createQuery(query)).toEqual(expectedQuery)
  })
})

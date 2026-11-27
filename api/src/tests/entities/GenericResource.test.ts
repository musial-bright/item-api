import { expect, describe, it, jest, beforeEach } from '@jest/globals'
import { mockClient } from 'aws-sdk-client-mock'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'

import GenericResource from '../../entities/GenericResource'

jest.mock('../../config/envVariables', () => {
  const original = jest.requireActual<
    typeof import('../../config/envVariables')
  >('../../config/envVariables')

  return {
    ...original,
    envEnvironment: jest.fn().mockReturnValue('test'),
  }
})

const ddbMock = mockClient(DynamoDBDocumentClient)

const resource = new GenericResource('test')

beforeEach(() => {
  ddbMock.reset()
})

describe('get', () => {
  it('returns the item from the GetCommand response', async () => {
    const item = { id: 'id-0', name: 'test-name' }
    ddbMock.on(GetCommand).resolves({ Item: item })

    const result = await resource.get({ keys: { id: 'id-0' } })

    expect(result).toEqual(item)
    expect(ddbMock.commandCalls(GetCommand)[0].args[0].input).toMatchObject({
      TableName: resource.tableName,
      Key: { id: 'id-0' },
    })
  })

  it('returns undefined when no item is found', async () => {
    ddbMock.on(GetCommand).resolves({})

    const result = await resource.get({ keys: { id: 'not-existing' } })

    expect(result).toEqual(undefined)
  })
})

describe('create', () => {
  it('creates a new item with timestamps when no id is given', async () => {
    ddbMock.on(PutCommand).resolves({})

    const result = await resource.create({ attrs: { name: 'test-name' } })

    expect(result.name).toEqual('test-name')
    expect(result.created_at).not.toBe(undefined)
    expect(result.updated_at).toEqual(result.created_at)
    expect(result.created_at_iso).not.toBe(undefined)
    expect(result.updated_at_iso).toEqual(result.created_at_iso)

    expect(ddbMock.commandCalls(GetCommand)).toHaveLength(0)
    expect(ddbMock.commandCalls(PutCommand)).toHaveLength(1)
    expect(ddbMock.commandCalls(PutCommand)[0].args[0].input).toMatchObject({
      TableName: resource.tableName,
      Item: { name: 'test-name' },
    })
  })

  it('creates a new item with the given id when it does not exist yet', async () => {
    ddbMock.on(GetCommand).resolves({})
    ddbMock.on(PutCommand).resolves({})

    const result = await resource.create({
      attrs: { id: 'id-0', name: 'test-name' },
    })

    expect(result.id).toEqual('id-0')
    expect(ddbMock.commandCalls(GetCommand)).toHaveLength(1)
    expect(ddbMock.commandCalls(PutCommand)).toHaveLength(1)
  })

  it('returns the existing item without writing, when the given id already exists', async () => {
    const existingItem = { id: 'id-0', name: 'existing-name' }
    ddbMock.on(GetCommand).resolves({ Item: existingItem })
    ddbMock.on(PutCommand).resolves({})

    const result = await resource.create({
      attrs: { id: 'id-0', name: 'a-different-name' },
    })

    expect(result).toEqual(existingItem)
    expect(ddbMock.commandCalls(PutCommand)).toHaveLength(0)
  })
})

describe('update', () => {
  it('returns undefined when no existing item is found', async () => {
    ddbMock.on(GetCommand).resolves({})

    const result = await resource.update({
      keys: { id: 'not-existing' },
      attrs: { content: 'new content' },
    })

    expect(result).toEqual(undefined)
    expect(ddbMock.commandCalls(PutCommand)).toHaveLength(0)
  })

  it('merges attrs on top of the existing item, preserving created_at and bumping updated_at', async () => {
    const existingItem = {
      id: 'id-0',
      name: 'test-name',
      user_id: 'user-0',
      content: 'old content',
      created_at: 1,
      created_at_iso: 'old-iso',
      updated_at: 1,
      updated_at_iso: 'old-iso',
    }
    ddbMock.on(GetCommand).resolves({ Item: existingItem })
    ddbMock.on(PutCommand).resolves({})

    const result = await resource.update({
      keys: { id: 'id-0' },
      attrs: {
        // these should all be stripped from the incoming attrs and not
        // override the existing item's values
        id: 'different-id',
        name: 'different-name',
        user_id: 'different-user',
        created_at: 999,
        created_at_iso: 'different-iso',
        content: 'new content',
      },
    })

    expect(result?.id).toEqual('id-0')
    expect(result?.name).toEqual('test-name')
    expect(result?.user_id).toEqual('user-0')
    expect(result?.content).toEqual('new content')
    expect(result?.created_at).toEqual(1)
    expect(result?.created_at_iso).toEqual('old-iso')
    expect(result?.updated_at).not.toEqual(1)
    expect(result?.updated_at_iso).not.toEqual('old-iso')

    expect(ddbMock.commandCalls(PutCommand)[0].args[0].input).toMatchObject({
      TableName: resource.tableName,
      Item: expect.objectContaining({ id: 'id-0', content: 'new content' }),
    })
  })

  it('defaults created_at when the existing item does not have one', async () => {
    const existingItem = { id: 'id-0', name: 'test-name' }
    ddbMock.on(GetCommand).resolves({ Item: existingItem })
    ddbMock.on(PutCommand).resolves({})

    const result = await resource.update({
      keys: { id: 'id-0' },
      attrs: { content: 'new content' },
    })

    expect(result?.created_at).not.toBe(undefined)
    expect(result?.created_at).toEqual(result?.updated_at)
  })
})

describe('delete', () => {
  it('returns true when an item was deleted', async () => {
    ddbMock.on(DeleteCommand).resolves({ Attributes: { id: 'id-0' } })

    const result = await resource.delete({ keys: { id: 'id-0' } })

    expect(result).toEqual(true)
    expect(ddbMock.commandCalls(DeleteCommand)[0].args[0].input).toMatchObject({
      TableName: resource.tableName,
      Key: { id: 'id-0' },
    })
  })

  it('returns false when no item existed to delete', async () => {
    ddbMock.on(DeleteCommand).resolves({})

    const result = await resource.delete({ keys: { id: 'not-existing' } })

    expect(result).toEqual(false)
  })
})

describe('queryBy', () => {
  it('returns items and count from the QueryCommand response', async () => {
    const items = [{ id: 'id-0' }, { id: 'id-1' }]
    ddbMock.on(QueryCommand).resolves({ Items: items, Count: 2 })

    const result = await resource.queryBy({
      indexNameSuffix: 'by-user-id',
      conditions: [
        { attrName: 'user_id', attrValue: 'user-0', condition: '=' },
      ],
    })

    expect(result.items).toEqual(items)
    expect(result.count).toEqual(2)
    expect(result.continuation).toEqual(undefined)
  })

  it('sets a continuation token when the response has a LastEvaluatedKey', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [],
      Count: 0,
      LastEvaluatedKey: { id: 'last-id' },
    })

    const result = await resource.queryBy({
      indexNameSuffix: 'by-user-id',
      conditions: [
        { attrName: 'user_id', attrValue: 'user-0', condition: '=' },
      ],
    })

    expect(result.continuation).toEqual(JSON.stringify({ id: 'last-id' }))
  })

  it('threads a continuation token into ExclusiveStartKey on the next request', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [], Count: 0 })

    await resource.queryBy({
      indexNameSuffix: 'by-user-id',
      conditions: [
        { attrName: 'user_id', attrValue: 'user-0', condition: '=' },
      ],
      continuation: JSON.stringify({ id: 'last-id' }),
    })

    expect(ddbMock.commandCalls(QueryCommand)[0].args[0].input).toMatchObject({
      ExclusiveStartKey: { id: 'last-id' },
    })
  })

  it('passes Select through to the QueryCommand', async () => {
    ddbMock.on(QueryCommand).resolves({ Count: 5 })

    await resource.queryBy({
      indexNameSuffix: 'by-user-id',
      conditions: [
        { attrName: 'user_id', attrValue: 'user-0', condition: '=' },
      ],
      select: 'COUNT',
    })

    expect(ddbMock.commandCalls(QueryCommand)[0].args[0].input).toMatchObject({
      Select: 'COUNT',
    })
  })
})

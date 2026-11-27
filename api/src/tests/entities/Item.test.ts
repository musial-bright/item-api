import { expect, describe, it, jest, beforeEach } from '@jest/globals'
import { mockClient } from 'aws-sdk-client-mock'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'

import Item from '../../entities/Item'

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

const item = new Item('test-item')

beforeEach(() => {
  ddbMock.reset()
})

describe('get', () => {
  it('returns the item when its name matches', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { id: 'id-0', name: 'test-item' } })

    const result = await item.get({ keys: { id: 'id-0' } })

    expect(result).toEqual({ id: 'id-0', name: 'test-item' })
  })

  it('returns undefined when the found item belongs to a different name', async () => {
    ddbMock
      .on(GetCommand)
      .resolves({ Item: { id: 'id-0', name: 'a-different-item' } })

    const result = await item.get({ keys: { id: 'id-0' } })

    expect(result).toEqual(undefined)
  })

  it('returns undefined when no item is found', async () => {
    ddbMock.on(GetCommand).resolves({})

    const result = await item.get({ keys: { id: 'not-existing' } })

    expect(result).toEqual(undefined)
  })
})

describe('create', () => {
  it('always generates a fresh id and forces its own name, regardless of attrs', async () => {
    // Item.create() always overwrites attrs.id with a fresh uuid before
    // calling super.create(), which means GenericResource's own
    // dedupe-by-id check (`if (id) { ... this.get(...) }`) always fires -
    // this stubs that real GetCommand call to "no existing item", which is
    // always true in practice since the id is freshly random.
    ddbMock.on(GetCommand).resolves({})
    ddbMock.on(PutCommand).resolves({})

    const result = await item.create({
      attrs: { id: 'attacker-supplied-id', name: 'a-different-name' },
    })

    expect(result.name).toEqual('test-item')
    expect(result.id).not.toEqual('attacker-supplied-id')
    expect(typeof result.id).toEqual('string')
    expect((result.id as string).length).toBeGreaterThan(0)
  })
})

describe('update', () => {
  it('ignores a name in attrs, forcing its own name', async () => {
    const existingItem = { id: 'id-0', name: 'test-item' }
    ddbMock.on(GetCommand).resolves({ Item: existingItem })
    ddbMock.on(PutCommand).resolves({})

    const result = await item.update({
      keys: { id: 'id-0' },
      attrs: { name: 'a-different-name', content: 'new content' },
    })

    expect(result?.name).toEqual('test-item')
    expect(result?.content).toEqual('new content')
  })

  it('only uses keys.id, ignoring any other key', async () => {
    ddbMock.on(GetCommand).resolves({ Item: { id: 'id-0', name: 'test-item' } })
    ddbMock.on(PutCommand).resolves({})

    await item.update({
      keys: { id: 'id-0', name: 'should-be-ignored' },
      attrs: { content: 'new content' },
    })

    expect(ddbMock.commandCalls(GetCommand)[0].args[0].input).toMatchObject({
      Key: { id: 'id-0' },
    })
  })
})

describe('delete', () => {
  it('only uses keys.id, ignoring any other key', async () => {
    ddbMock.on(DeleteCommand).resolves({ Attributes: { id: 'id-0' } })

    const result = await item.delete({
      keys: { id: 'id-0', name: 'should-be-ignored' },
    })

    expect(result).toEqual(true)
    expect(ddbMock.commandCalls(DeleteCommand)[0].args[0].input).toMatchObject({
      Key: { id: 'id-0' },
    })
  })
})

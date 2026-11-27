import { expect, describe, it, jest, beforeEach } from '@jest/globals'
import { mockClient } from 'aws-sdk-client-mock'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'

import MyItem, { IdPartSeparator } from '../../entities/MyItem'

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

const userId = 'user-0'
const myItem = new MyItem(userId, 'test-item')

beforeEach(() => {
  ddbMock.reset()
})

describe('identifier', () => {
  it(`joins userId and name with "${IdPartSeparator}"`, () => {
    expect(myItem.identifier()).toEqual(`${userId}${IdPartSeparator}test-item`)
  })
})

describe('get', () => {
  it('looks up by the computed identifier', async () => {
    ddbMock
      .on(GetCommand)
      .resolves({ Item: { id: myItem.identifier(), name: 'test-item' } })

    const result = await myItem.get()

    expect(result?.id).toEqual(myItem.identifier())
    expect(ddbMock.commandCalls(GetCommand)[0].args[0].input).toMatchObject({
      Key: { id: myItem.identifier() },
    })
  })
})

describe('create', () => {
  it('forces id, name and user_id, regardless of attrs', async () => {
    ddbMock.on(GetCommand).resolves({})
    ddbMock.on(PutCommand).resolves({})

    const result = await myItem.create({
      attrs: {
        id: 'attacker-supplied-id',
        name: 'a-different-name',
        user_id: 'a-different-user',
        content: 'hello',
      },
    })

    expect(result.id).toEqual(myItem.identifier())
    expect(result.name).toEqual('test-item')
    expect(result.user_id).toEqual(userId)
    expect(result.content).toEqual('hello')
  })

  it('is a no-op upsert when a record for this identifier already exists', async () => {
    const existingItem = { id: myItem.identifier(), name: 'test-item' }
    ddbMock.on(GetCommand).resolves({ Item: existingItem })
    ddbMock.on(PutCommand).resolves({})

    const result = await myItem.create({ attrs: { content: 'new content' } })

    expect(result).toEqual(existingItem)
    expect(ddbMock.commandCalls(PutCommand)).toHaveLength(0)
  })
})

describe('update', () => {
  it('forces id, name and user_id, regardless of attrs', async () => {
    const existingItem = {
      id: myItem.identifier(),
      name: 'test-item',
      user_id: userId,
    }
    ddbMock.on(GetCommand).resolves({ Item: existingItem })
    ddbMock.on(PutCommand).resolves({})

    const result = await myItem.update({
      attrs: {
        id: 'a-different-id',
        name: 'a-different-name',
        user_id: 'a-different-user',
        content: 'new content',
      },
    })

    expect(result?.id).toEqual(myItem.identifier())
    expect(result?.name).toEqual('test-item')
    expect(result?.user_id).toEqual(userId)
    expect(result?.content).toEqual('new content')
  })
})

describe('delete', () => {
  it('deletes by the computed identifier', async () => {
    ddbMock
      .on(DeleteCommand)
      .resolves({ Attributes: { id: myItem.identifier() } })

    const result = await myItem.delete()

    expect(result).toEqual(true)
    expect(ddbMock.commandCalls(DeleteCommand)[0].args[0].input).toMatchObject({
      Key: { id: myItem.identifier() },
    })
  })
})

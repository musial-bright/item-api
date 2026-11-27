import { expect, describe, it, jest, beforeAll, afterEach } from '@jest/globals'

import ServiceEntity from '../../entities/ServiceEntity'
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

const service = new ServiceEntity()

// The `service` table has no GSIs (see aws/dynamodb/src/createTable/createServiceTable.ts), so
// unlike Item/MyItem there is no `by-name`/`by-category` query to clean up
// via - cleanup here deletes exactly the known {category, name} keys used
// by these tests.
const category0 = 'test-category-jest'
const name0 = 'test-name-0'
const name1 = 'test-name-1'

const attrs0: ResourceAttributesType = {
  category: category0,
  name: name0,
  test: 'ServiceEntity.testlocal.ts',
  access_token: 'token-0',
  expires_in: 9000,
}

const attrs1: ResourceAttributesType = {
  category: category0,
  name: name1,
  test: 'ServiceEntity.testlocal.ts',
  access_token: 'token-1',
  expires_in: 8000,
}

const cleanupDb = async () => {
  await service.delete({ keys: { category: category0, name: name0 } })
  await service.delete({ keys: { category: category0, name: name1 } })
}

beforeAll(async () => {
  await cleanupDb()
})

afterEach(async () => {
  await cleanupDb()
})

describe('get', () => {
  it('has no item for a non-existing key', async () => {
    const getItem = await service.get({
      keys: { category: category0, name: 'not-existing-name' },
    })

    expect(getItem).toEqual(undefined)
  })

  it('has item after creation', async () => {
    const createdItem = await service.create({ attrs: attrs0 })

    const getItem = await service.get({
      keys: { category: category0, name: name0 },
    })

    expect(getItem).toEqual(createdItem)
    expect(getItem?.access_token).toEqual(attrs0.access_token)
  })
})

describe('create', () => {
  it('creates a new item keyed by category and name', async () => {
    const createdItem = await service.create({ attrs: attrs0 })

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { created_at, updated_at, created_at_iso, updated_at_iso, ...rest } =
      createdItem
    /* eslint-enable @typescript-eslint/no-unused-vars */

    expect(rest).toEqual(attrs0)
    expect(createdItem.created_at).not.toBe(undefined)
    expect(createdItem.updated_at).not.toBe(undefined)
    expect(createdItem.created_at).toEqual(createdItem.updated_at)
  })

  it('does not collide with a different name under the same category', async () => {
    await service.create({ attrs: attrs0 })
    await service.create({ attrs: attrs1 })

    const item0 = await service.get({
      keys: { category: category0, name: name0 },
    })
    const item1 = await service.get({
      keys: { category: category0, name: name1 },
    })

    expect(item0?.access_token).toEqual(attrs0.access_token)
    expect(item1?.access_token).toEqual(attrs1.access_token)
  })

  it('overwrites an existing item on the same category/name (no id-based dedupe)', async () => {
    await service.create({ attrs: attrs0 })
    const overwritten = await service.create({
      attrs: { ...attrs0, access_token: 'token-overwritten' },
    })

    expect(overwritten.access_token).toEqual('token-overwritten')

    const getItem = await service.get({
      keys: { category: category0, name: name0 },
    })
    expect(getItem?.access_token).toEqual('token-overwritten')
  })
})

describe('update', () => {
  it('has no item for a non-existing key', async () => {
    const updateItem = await service.update({
      keys: { category: category0, name: 'not-existing-name' },
      attrs: { access_token: 'new-token' },
    })

    expect(updateItem).toEqual(undefined)
  })

  it('updates an existing item, keeping created_at and bumping updated_at', async () => {
    const createdItem = await service.create({ attrs: attrs0 })

    const updatedItem = await service.update({
      keys: { category: category0, name: name0 },
      attrs: { access_token: 'token-updated' },
    })

    expect(updatedItem?.access_token).toEqual('token-updated')
    expect(updatedItem?.created_at).toEqual(createdItem.created_at)
    expect(updatedItem?.updated_at).not.toEqual(createdItem.updated_at)

    const reloadedItem = await service.get({
      keys: { category: category0, name: name0 },
    })
    expect(reloadedItem?.access_token).toEqual('token-updated')
  })
})

describe('delete', () => {
  it('deletes an existing item', async () => {
    await service.create({ attrs: attrs0 })

    const deleted = await service.delete({
      keys: { category: category0, name: name0 },
    })
    expect(deleted).toEqual(true)

    const reloadedItem = await service.get({
      keys: { category: category0, name: name0 },
    })
    expect(reloadedItem).toEqual(undefined)
  })

  it('returns false for a non-existing item', async () => {
    const deleted = await service.delete({
      keys: { category: category0, name: 'not-existing-name' },
    })

    expect(deleted).toEqual(false)
  })
})

describe('queryBy', () => {
  it('is not supported and returns an empty result', async () => {
    const warnSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const result = await service.queryBy({
      indexNameSuffix: 'by-name',
      conditions: [{ attrName: 'name', attrValue: name0, condition: '=' }],
    })

    expect(result).toEqual({ items: [] })
    expect(warnSpy).toHaveBeenCalled()

    warnSpy.mockRestore()
  })
})

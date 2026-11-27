import { expect, describe, it, jest, afterEach } from '@jest/globals'

import GenericResource from '../../entities/GenericResource'
import { ResourceAttributesType, ResourceType } from '../../entities/types'
import {
  getGlobalConfig,
  updateGlobalConfig,
  DefaultGlobalConfig,
  GlobalConfigKey,
} from '../../service/globalConfigService'

jest.mock('../../config/envVariables', () => {
  const original = jest.requireActual<
    typeof import('../../config/envVariables')
  >('../../config/envVariables')

  return {
    ...original,
    envEnvironment: jest.fn().mockReturnValue('test'),
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

const mockStoredConfig = (storedConfig?: ResourceType) => {
  jest
    .spyOn(GenericResource.prototype, 'get')
    .mockImplementation(async ({ keys }: { keys: ResourceAttributesType }) => {
      if (
        keys.category === GlobalConfigKey.category &&
        keys.name === GlobalConfigKey.name
      ) {
        return storedConfig
      }

      return undefined
    })
}

describe('getGlobalConfig', () => {
  it('returns the default config when no record is stored', async () => {
    mockStoredConfig(undefined)

    const config = await getGlobalConfig()

    expect(config).toEqual(DefaultGlobalConfig)
  })

  it('merges a stored override on top of the defaults', async () => {
    mockStoredConfig({
      ...GlobalConfigKey,
      itemLimits: { maxItemsPerUser: 5 },
    })

    const config = await getGlobalConfig()

    expect(config.itemLimits.maxItemsPerUser).toBe(5)
  })
})

describe('updateGlobalConfig', () => {
  it('stores the patch and returns the merged config when no record existed yet', async () => {
    mockStoredConfig(undefined)
    const createSpy = jest
      .spyOn(GenericResource.prototype, 'create')
      .mockImplementation(async ({ attrs }) => attrs)

    const config = await updateGlobalConfig({
      itemLimits: { maxItemsPerUser: 10 },
    })

    expect(config.itemLimits.maxItemsPerUser).toBe(10)
    expect(createSpy).toHaveBeenCalledWith({
      attrs: {
        ...GlobalConfigKey,
        itemLimits: { maxItemsPerUser: 10 },
      },
    })
  })

  it('merges the patch onto the stored record, not onto the defaults', async () => {
    mockStoredConfig({
      ...GlobalConfigKey,
      itemLimits: { maxItemsPerUser: 5 },
      otherFeature: { enabled: true },
    })
    const createSpy = jest
      .spyOn(GenericResource.prototype, 'create')
      .mockImplementation(async ({ attrs }) => attrs)

    const config = await updateGlobalConfig({
      itemLimits: { maxItemsPerUser: 10 },
    })

    expect(config.itemLimits.maxItemsPerUser).toBe(10)
    expect(createSpy).toHaveBeenCalledWith({
      attrs: {
        ...GlobalConfigKey,
        itemLimits: { maxItemsPerUser: 10 },
        otherFeature: { enabled: true },
      },
    })
  })
})

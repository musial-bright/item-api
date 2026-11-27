import ServiceEntity from '../entities/ServiceEntity'
import { deepMerge } from '../utils/objectTools'

export const GlobalConfigKey = {
  category: 'config',
  name: 'global',
}

export type GlobalConfig = {
  itemLimits: {
    maxItemsPerUser: number
  }
}

export const DefaultGlobalConfig: GlobalConfig = {
  itemLimits: {
    maxItemsPerUser: 2000,
  },
}

export type GlobalConfigPatch = {
  itemLimits?: Partial<GlobalConfig['itemLimits']>
}

export const getGlobalConfig = async (): Promise<GlobalConfig> => {
  const service = new ServiceEntity()
  const storedConfig = await service.get({ keys: GlobalConfigKey })

  return deepMerge(DefaultGlobalConfig, storedConfig || {})
}

/**
 * Deep-merges `patch` onto the *stored* override record (not onto
 * `DefaultGlobalConfig`), so defaults stay out of the DB and only ever come
 * from code - a future change to a default won't get masked by a value that
 * was merely baked into storage by an earlier, unrelated update.
 */
export const updateGlobalConfig = async (
  patch: GlobalConfigPatch,
): Promise<GlobalConfig> => {
  const service = new ServiceEntity()
  const storedConfig = (await service.get({ keys: GlobalConfigKey })) || {}

  const mergedStoredConfig = deepMerge(storedConfig, patch)

  await service.create({
    attrs: { ...GlobalConfigKey, ...mergedStoredConfig },
  })

  return deepMerge(DefaultGlobalConfig, mergedStoredConfig)
}

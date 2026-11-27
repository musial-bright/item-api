import GenericResource from '../entities/GenericResource'
import { errorMessages, UnprocessableContentError } from '../utils/errors'
import { getGlobalConfig } from './globalConfigService'

export const getMaxItemsPerUser = async (): Promise<number> => {
  const config = await getGlobalConfig()

  return config.itemLimits.maxItemsPerUser
}

export const countUserItems = async ({
  userId,
  limit,
}: {
  userId: string
  limit: number
}): Promise<number> => {
  const item = new GenericResource('item')

  let total = 0
  let continuation: string | undefined

  do {
    const result = await item.queryBy({
      indexNameSuffix: 'by-user-id',
      conditions: [{ attrName: 'user_id', attrValue: userId, condition: '=' }],
      continuation,
      select: 'COUNT',
    })

    total += result.count || 0
    continuation = result.continuation
  } while (continuation && total < limit)

  return total
}

export const assertUserCanCreateItem = async ({
  userId,
}: {
  userId: string
}): Promise<void> => {
  const limit = await getMaxItemsPerUser()
  const currentCount = await countUserItems({ userId, limit })

  if (currentCount >= limit) {
    throw UnprocessableContentError({
      message: errorMessages.itemLimitExceeded(limit),
    })
  }
}

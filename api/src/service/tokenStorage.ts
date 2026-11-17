import ServiceEntity from '../entities/ServiceEntity'
import { ResourceAttributesType } from '../entities/types'
import { StoredToken, TokenResponse } from './iam/utils/types'

const Defaults = {
  ttlExpiresBefore: 20000, // 20sec before real expiration time
}

export const loadCachedToken = async ({
  category,
  tokenName,
}: {
  category: string
  tokenName: string
}): Promise<StoredToken | undefined> => {
  const service = new ServiceEntity()
  const storedToken = (await service.get({
    keys: {
      category: category,
      name: tokenName,
    },
  })) as StoredToken
  if (storedToken && isStoredTokenValid(storedToken)) {
    return storedToken
  }

  return undefined
}

export const saveToken = async ({
  token,
  category,
  tokenName,
}: {
  token: TokenResponse
  category: string
  tokenName: string
}): Promise<ResourceAttributesType> => {
  const service = new ServiceEntity()
  const entityKeys = {
    category: category,
    name: tokenName,
  }
  await service.delete({ keys: entityKeys })
  const ttl =
    new Date().getTime() + token.expires_in * 1000 - Defaults.ttlExpiresBefore
  const tokenForStorage: StoredToken = {
    ...token,
    ttl,
    ...entityKeys,
  }

  return service.create({ attrs: tokenForStorage })
}

export const deleteToken = async ({
  category,
  tokenName,
}: {
  category: string
  tokenName: string
}): Promise<boolean> => {
  const service = new ServiceEntity()
  return service.delete({
    keys: {
      category: category,
      name: tokenName,
    },
  })
}

export const isStoredTokenValid = (storedToken: ResourceAttributesType) => {
  return storedToken.ttl - Defaults.ttlExpiresBefore > new Date().getTime()
}

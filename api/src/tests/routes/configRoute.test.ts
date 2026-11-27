import { expect, describe, it, jest, beforeEach } from '@jest/globals'

import fastifyConfig from '../../config/fastifyConfig'
import service from '../../service'
import { currentUserFixture } from '../__fixtures__/currentUserFixture'
import {
  getGlobalConfig,
  updateGlobalConfig,
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

jest.mock('../../service/authorizationService', () => {
  const original = jest.requireActual<
    typeof import('../../service/authorizationService')
  >('../../service/authorizationService')

  return {
    ...original,
    authorizationGuard: jest.fn().mockReturnValue(undefined),
  }
})

jest.mock('../../decorator/currentUser', () => {
  const original = jest.requireActual<
    typeof import('../../decorator/currentUser')
  >('../../decorator/currentUser')

  return {
    ...original,
    getCurrentUser: jest
      .fn()
      .mockImplementation(() => currentUserFixture('administrator')),
  }
})

jest.mock('../../service/globalConfigService', () => {
  const original = jest.requireActual<
    typeof import('../../service/globalConfigService')
  >('../../service/globalConfigService')

  return {
    ...original,
    getGlobalConfig: jest.fn(),
    updateGlobalConfig: jest.fn(),
  }
})

beforeEach(() => {
  jest
    .mocked(getGlobalConfig)
    .mockResolvedValue({ itemLimits: { maxItemsPerUser: 2000 } })
  jest
    .mocked(updateGlobalConfig)
    .mockResolvedValue({ itemLimits: { maxItemsPerUser: 5000 } })
})

describe('routes', () => {
  describe(`GET /${fastifyConfig.register.prefix}/config`, () => {
    it('returns the current global config', async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/config`,
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual({
        itemLimits: { maxItemsPerUser: 2000 },
      })
    })
  })

  describe(`PATCH /${fastifyConfig.register.prefix}/config`, () => {
    it('updates the global config and returns the new value', async () => {
      const response = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/config`,
        payload: { itemLimits: { maxItemsPerUser: 5000 } },
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual({
        itemLimits: { maxItemsPerUser: 5000 },
      })
      expect(updateGlobalConfig).toHaveBeenCalledWith({
        itemLimits: { maxItemsPerUser: 5000 },
      })
    })

    it('rejects a non-numeric maxItemsPerUser', async () => {
      const response = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/config`,
        payload: { itemLimits: { maxItemsPerUser: 'not-a-number' } },
      })

      expect(response.statusCode).toBe(400)
    })

    // Fastify's AJV defaults include `removeAdditional: true`, so with
    // `additionalProperties: false` unknown properties are silently
    // stripped from the body rather than rejected - same behavior every
    // other schema in this project already relies on.
    it('strips unknown top-level properties instead of rejecting', async () => {
      const response = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/config`,
        payload: { somethingElse: true },
      })

      expect(response.statusCode).toBe(200)
      expect(updateGlobalConfig).toHaveBeenCalledWith({})
    })

    it('strips unknown properties inside itemLimits instead of rejecting', async () => {
      const response = await service.inject({
        method: 'PATCH',
        url: `/${fastifyConfig.register.prefix}/config`,
        payload: { itemLimits: { somethingElse: true } },
      })

      expect(response.statusCode).toBe(200)
      expect(updateGlobalConfig).toHaveBeenCalledWith({ itemLimits: {} })
    })
  })
})

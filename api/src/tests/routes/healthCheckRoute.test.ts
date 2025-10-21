import { expect, describe, it, jest } from '@jest/globals'

import fastifyConfig from '../../config/fastifyConfig'

import service from '../../service'
import { UnauthorizedError } from '../../utils/errors'

jest.mock('../../config/variableConfig', () => {
  return {
    currentEnvironment: jest.fn().mockReturnValue('test'),
  }
})

jest.mock('../../service/authorizationService', () => {
  return {
    authorizationGuard: jest.fn().mockImplementation(() => {
      throw UnauthorizedError({ message: 'UnauthorizedError' })
    }),
  }
})

describe('routes', () => {
  describe(`GET /${fastifyConfig.register.prefix}/health-check`, () => {
    it('gets 200 response code', async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/health-check`,
      })

      const body = JSON.parse(response.body)

      expect(response.statusCode).toBe(200)
      expect(body.version).toBe('1.3.0')
      expect(body.date).not.toEqual('')
      expect(body.status.access).toEqual('OK')
    })
  })
})

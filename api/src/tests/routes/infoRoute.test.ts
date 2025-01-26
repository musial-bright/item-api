import { expect, describe, it, jest } from '@jest/globals'

import service from '../../service'

jest.mock('../../config/variableConfig', () => {
  return {
    currentEnvironemnt: jest.fn().mockReturnValue('test'),
  }
})

jest.mock('../../service/authorizationService', () => {
  return {
    authorizationGuard: jest.fn().mockReturnValue({}),
  }
})

describe('routes', () => {
  describe('/api/info', () => {
    it('gets 200 response code', async () => {
      const response = await service.inject({
        method: 'GET',
        url: '/api/info',
      })

      const body = JSON.parse(response.body)

      expect(response.statusCode).toBe(200)
      expect(body.info.name).toBe('item-api')
      expect(body.info.version).toBe('1.0.0')
      expect(body.info.copyright).toBe('Adam Musial-Bright')
    })
  })
})

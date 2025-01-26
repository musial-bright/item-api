import { expect, describe, it, jest } from '@jest/globals'

import fastifyConfig from '../../config/fastifyConfig'

import service from '../../service'

jest.mock('../../config/variableConfig', () => {
  return {
    currentEnvironemnt: jest.fn().mockReturnValue('test'),
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
      expect(body.version).toBe('1.0.0')
      expect(body.date).not.toEqual('')
      expect(body.status.access).toEqual('OK')
    })
  })
})

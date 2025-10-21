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
      throw UnauthorizedError({ message: 'Unauthorized' })
    }),
  }
})

describe('routes', () => {
  describe(`GET /${fastifyConfig.register.prefix}/info`, () => {
    it('gets 401 response code', async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/info`,
      })

      expect(response.statusCode).toBe(401)

      const body = JSON.parse(response.body)
      expect(body).toEqual({
        code: '401',
        error: 'Unauthorized',
        details: 'UnauthorizedError',
      })
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/api/item/some-item`, () => {
    it('gets 401 response code', async () => {
      const response = await service.inject({
        method: 'GET',
        url: `/${fastifyConfig.register.prefix}/api/item/some-item`,
      })

      expect(response.statusCode).toBe(401)

      const body = JSON.parse(response.body)
      expect(body).toEqual({
        code: '401',
        error: 'Unauthorized',
        details: 'UnauthorizedError',
      })
    })
  })

  describe(`GET /${fastifyConfig.register.prefix}/api/item/some-item/some-id`, () => {
    it('get fails with 404', async () => {
      const response = await service.inject({
        method: 'GET',
        url: '/api/item/some-item/some-id',
      })

      expect(response.statusCode).toBe(401)

      const body = JSON.parse(response.body)
      expect(body).toEqual({
        code: '401',
        error: 'Unauthorized',
        details: 'UnauthorizedError',
      })
    })
  })

  describe('POST /api/item/some-item', () => {
    it('creates new item', async () => {
      const payload = {
        content: { desc: 'new content', attribute: 1234567890 },
      }
      const responsePost = await service.inject({
        method: 'POST',
        url: '/api/item/some-item',
        payload: payload,
      })

      expect(responsePost.statusCode).toBe(401)

      const body = JSON.parse(responsePost.body)
      expect(body).toEqual({
        code: '401',
        error: 'Unauthorized',
        details: 'UnauthorizedError',
      })
    })
  })

  describe(`PATCH /api/item/some-item/some-id`, () => {
    it('delete fails with 404', async () => {
      const payload = { content: { desc: 'updated-content', something: 9 } }
      const responsePatch = await service.inject({
        method: 'PATCH',
        url: `/api/item/some-item/some-id`,
        payload: payload,
      })

      expect(responsePatch.statusCode).toBe(401)

      const body = JSON.parse(responsePatch.body)
      expect(body).toEqual({
        code: '401',
        error: 'Unauthorized',
        details: 'UnauthorizedError',
      })
    })
  })

  describe(`DELETE /api/item/some-item/some-id`, () => {
    it('deletes fails with 404', async () => {
      const responseDelete = await service.inject({
        method: 'DELETE',
        url: `/api/item/some-item/some-id`,
      })

      expect(responseDelete.statusCode).toBe(401)

      const body = JSON.parse(responseDelete.body)
      expect(body).toEqual({
        code: '401',
        error: 'Unauthorized',
        details: 'UnauthorizedError',
      })
    })
  })
})

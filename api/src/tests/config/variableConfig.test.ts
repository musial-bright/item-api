import { beforeEach, expect, describe, it, jest } from '@jest/globals'

import { envEnvironment } from '../../config/envVariables'
import { currentEnvironemnt } from '../../config/variableConfig'

jest.mock('../../config/envVariables')

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

const envEnvironmentMock = envEnvironment as jest.MockedFunction<
  typeof envEnvironment
>

describe('currentEnvironemnt', () => {
  describe('when process.env.ENVIRONMENT is empty', () => {
    it('has fallback "development" environment', () => {
      envEnvironmentMock.mockImplementation(() => '')

      expect(currentEnvironemnt()).toEqual('development')
      expect(console.error).toBeCalled()
    })
  })

  describe('when process.env.ENVIRONMENT is set to an unsupported value', () => {
    it('has fallback "development" environment', () => {
      envEnvironmentMock.mockImplementation(() => 'unsupported value')

      expect(currentEnvironemnt()).toEqual('development')
      expect(console.error).toBeCalled()
    })
  })

  describe('when process.env.ENVIRONMENT is set', () => {
    it('has correct environment', () => {
      envEnvironmentMock.mockImplementation(() => 'test')

      expect(currentEnvironemnt()).toEqual('test')
    })
  })
})

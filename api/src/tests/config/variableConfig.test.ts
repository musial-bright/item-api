import { expect, describe, it, jest } from '@jest/globals'

import { envEnvironment } from '../../config/envVariables'
import { currentEnvironemnt } from '../../config/variableConfig'

jest.mock('../../config/envVariables')

const envEnvironmentMock = envEnvironment as jest.MockedFunction<
  typeof envEnvironment
>

describe('currentEnvironemnt', () => {
  describe('when process.env.ENVIRONMENT is empty', () => {
    it('has fallback "development" environment', () => {
      envEnvironmentMock.mockImplementation(() => '')

      expect(currentEnvironemnt()).toEqual('development')
    })
  })

  describe('when process.env.ENVIRONMENT is set to an unsupported value', () => {
    it('has fallback "development" environment', () => {
      envEnvironmentMock.mockImplementation(() => 'unsupported value')

      expect(currentEnvironemnt()).toEqual('development')
    })
  })

  describe('when process.env.ENVIRONMENT is set', () => {
    it('has correct environment', () => {
      envEnvironmentMock.mockImplementation(() => 'test')

      expect(currentEnvironemnt()).toEqual('test')
    })
  })
})

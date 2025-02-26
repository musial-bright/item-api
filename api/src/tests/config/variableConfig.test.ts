import { expect, describe, it, jest } from '@jest/globals'

import { envEnvironment } from '../../config/envVariables'
import { currentEnvironemnt } from '../../config/variableConfig'

jest.mock('../../config/envVariables')

const envEnvironmentMock = envEnvironment as jest.MockedFunction<
  typeof envEnvironment
>

describe('currentEnvironemnt', () => {
  describe('when process.env.ENVIRONMENT is empty', () => {
    it('throws error', () => {
      envEnvironmentMock.mockImplementation(() => '')

      expect(() => currentEnvironemnt()).toThrow(Error)
      expect(() => currentEnvironemnt()).toThrow(
        'envEnvironment() process.env.ENVIRONMENT is empty',
      )
    })
  })

  describe('when process.env.ENVIRONMENT is set', () => {
    it('throws error when process.env.ENVIRONMENT is empty', () => {
      envEnvironmentMock.mockImplementation(() => 'test')

      expect(currentEnvironemnt()).toEqual('test')
    })
  })
})

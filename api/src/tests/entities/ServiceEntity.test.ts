import { expect, describe, it, jest } from '@jest/globals'

import ServiceEntity from '../../entities/ServiceEntity'

jest.mock('../../config/envVariables', () => {
  const original = jest.requireActual<
    typeof import('../../config/envVariables')
  >('../../config/envVariables')

  return {
    ...original,
    envEnvironment: jest.fn().mockReturnValue('test'),
  }
})

describe('queryBy', () => {
  it('is not supported: logs and returns an empty result without touching the DB', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const service = new ServiceEntity()

    const result = await service.queryBy({
      indexNameSuffix: 'by-name',
      conditions: [
        { attrName: 'name', attrValue: 'test-name', condition: '=' },
      ],
    })

    expect(result).toEqual({ items: [] })
    expect(errorSpy).toHaveBeenCalledTimes(1)

    errorSpy.mockRestore()
  })
})

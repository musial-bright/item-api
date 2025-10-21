import { expect, describe, it } from '@jest/globals'

import { cleanArray } from '../../utils/arrayTools'

describe('cleanArray()', () => {
  it('has a clean array', () => {
    const input = [
      '    Clean/       ',
      ' Path   To   File/ / ',
      '  TEST Folder///   ',
      ' Another   One  /',
      '   ',
      '',
      'Multi   SPACE /  ',
    ]

    const expected = [
      'clean',
      'path-to-file',
      'test-folder',
      'another-one',
      'multi-space',
    ]

    expect(cleanArray(input)).toEqual(expected)
  })
})

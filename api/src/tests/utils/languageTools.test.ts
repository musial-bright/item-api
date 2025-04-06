import { expect, describe, it } from '@jest/globals'

import { allEqual } from '../../utils/languageTools'

describe('allEqual', () => {
  it('has same items on empty array', () => {
    expect(allEqual<boolean>([])).toBeTruthy()
  })

  it('has not same items', () => {
    expect(allEqual<boolean>([true, false, true])).toBeFalsy()
  })

  it('has same items', () => {
    expect(allEqual<boolean>([true, true, true])).toBeTruthy()
  })
})

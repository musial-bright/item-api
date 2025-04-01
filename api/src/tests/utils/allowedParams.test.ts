import { expect, describe, it } from '@jest/globals'

import { allowedParams } from '../../utils/allowedParams'

const attributes = {
  id: 'not allowed',
  content: 'some content',
  user_id: 'some user id',
  name: 'not allowed',
}

describe('allowedParams()', () => {
  it('has no attributes when allowed and attributes empty', () => {
    const result = allowedParams({
      allowed: [],
      attributes: {},
    })

    expect(result).toEqual({})
  })

  it('has no attributes when attributes empty', () => {
    const result = allowedParams({
      allowed: ['content', 'user_id'],
      attributes: {},
    })

    expect(result).toEqual({})
  })

  it('has no attributes when allowed empty', () => {
    const result = allowedParams({
      allowed: [],
      attributes,
    })

    expect(result).toEqual({})
  })

  it('has no attributes', () => {
    const result = allowedParams({
      allowed: ['not_existing', 'even_less_existing'],
      attributes,
    })

    expect(result).toEqual({})
  })

  it('has selected allowed attributes', () => {
    const result = allowedParams({
      allowed: ['content', 'user_id'],
      attributes,
    })

    expect(result).toEqual({
      content: 'some content',
      user_id: 'some user id',
    })
  })
})

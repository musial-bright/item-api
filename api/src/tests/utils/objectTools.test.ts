import { expect, describe, it } from '@jest/globals'

import { deepMerge, isPlainObject } from '../../utils/objectTools'

describe('isPlainObject', () => {
  it('returns true for a plain object', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ a: 1 })).toBe(true)
  })

  it('returns false for null', () => {
    expect(isPlainObject(null)).toBe(false)
  })

  it('returns false for an array', () => {
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject([1, 2, 3])).toBe(false)
  })

  it('returns false for primitives', () => {
    expect(isPlainObject('string')).toBe(false)
    expect(isPlainObject(123)).toBe(false)
    expect(isPlainObject(true)).toBe(false)
    expect(isPlainObject(undefined)).toBe(false)
  })

  it('returns false for a function', () => {
    expect(isPlainObject(() => undefined)).toBe(false)
  })

  it('returns true for other object instances (e.g. Date) - it only checks typeof/null/Array, not "plainness"', () => {
    expect(isPlainObject(new Date())).toBe(true)
  })
})

describe('deepMerge', () => {
  it('keeps base properties when override is empty', () => {
    expect(deepMerge({ a: 1, b: { c: 2 } }, {})).toEqual({ a: 1, b: { c: 2 } })
  })

  it('overrides scalar properties', () => {
    expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 })
  })

  it('merges nested objects, keeping sibling defaults untouched', () => {
    const base = { group: { x: 1, y: 2 } }
    const override = { group: { y: 99 } }

    expect(deepMerge(base, override)).toEqual({ group: { x: 1, y: 99 } })
  })

  it('adds new top-level properties from override', () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('replaces arrays wholesale instead of merging them', () => {
    expect(deepMerge({ a: [1, 2] }, { a: [3] })).toEqual({ a: [3] })
  })
})

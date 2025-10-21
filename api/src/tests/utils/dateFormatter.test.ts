import { expect, describe, it } from '@jest/globals'

import { formatUTCDate } from '../../utils/dateFormatter'

describe('formatUTCDate', () => {
  it('formats a fixed date correctly', () => {
    const date = new Date(Date.UTC(2025, 0, 5, 9, 7)) // Jan 5 2025, 09:07 UTC
    const result = formatUTCDate(date)

    expect(result).toBe('2025-01-05_09-07')
  })

  it('pads single-digit values correctly', () => {
    const date = new Date(Date.UTC(2025, 2, 3, 4, 5)) // Mar 3, 2025, 04:05 UTC
    const result = formatUTCDate(date)

    expect(result).toBe('2025-03-03_04-05')
  })

  it('returns a string for current date when no argument passed', () => {
    const result = formatUTCDate()

    expect(typeof result).toBe('string')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}$/) // YYYY-MM-DD_HH-MM
  })
})

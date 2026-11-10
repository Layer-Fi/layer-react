import { describe, expect, it } from 'vitest'

import { averageCents } from '@utils/shared/number/bugbotRetry'

describe('averageCents', () => {
  it('averages the values', () => {
    expect(averageCents([100, 200, 300])).toBe(200)
  })

  it('rounds to whole cents', () => {
    expect(averageCents([100, 200, 350])).toBe(217)
    expect(averageCents([100, 101])).toBe(101)
  })

  it('returns zero for an empty list', () => {
    expect(averageCents([])).toBe(0)
  })
})

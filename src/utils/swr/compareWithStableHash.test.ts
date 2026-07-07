import { BigDecimal } from 'effect'
import { describe, expect, it } from 'vitest'

import { compareWithStableHash } from '@utils/swr/compareWithStableHash'

describe('compareWithStableHash', () => {
  it('treats equal primitives as equal', () => {
    expect(compareWithStableHash(1, 1)).toBe(true)
    expect(compareWithStableHash('a', 'a')).toBe(true)
    expect(compareWithStableHash(true, true)).toBe(true)
  })

  it('distinguishes different primitives', () => {
    expect(compareWithStableHash(1, 2)).toBe(false)
    expect(compareWithStableHash('a', 'b')).toBe(false)
  })

  it('distinguishes the number 1 from the string "1"', () => {
    expect(compareWithStableHash(1, '1')).toBe(false)
  })

  it('ignores object key ordering', () => {
    expect(compareWithStableHash({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
  })

  it('detects differing object values', () => {
    expect(compareWithStableHash({ a: 1 }, { a: 2 })).toBe(false)
  })

  it('ignores keys explicitly set to undefined', () => {
    expect(compareWithStableHash({ a: 1, b: undefined }, { a: 1 })).toBe(true)
  })

  it('compares nested structures and arrays', () => {
    expect(compareWithStableHash({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true)
    expect(compareWithStableHash([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(compareWithStableHash([1, 2], [2, 1])).toBe(false)
  })

  it('compares dates by their value', () => {
    expect(compareWithStableHash(new Date('2020-01-01'), new Date('2020-01-01'))).toBe(true)
    expect(compareWithStableHash(new Date('2020-01-01'), new Date('2021-01-01'))).toBe(false)
  })

  it('compares equal BigDecimal values by their string representation', () => {
    expect(
      compareWithStableHash(BigDecimal.make(100n, 2), BigDecimal.make(100n, 2)),
    ).toBe(true)
  })

  it('distinguishes different BigDecimal values', () => {
    expect(
      compareWithStableHash(BigDecimal.make(100n, 2), BigDecimal.make(200n, 2)),
    ).toBe(false)
  })

  it('compares BigDecimal values nested inside objects without infinite recursion', () => {
    const a = { amount: BigDecimal.make(1234n, 2) }
    const b = { amount: BigDecimal.make(1234n, 2) }
    expect(compareWithStableHash(a, b)).toBe(true)
  })

  it('treats two undefined values as equal', () => {
    expect(compareWithStableHash(undefined, undefined)).toBe(true)
  })
})

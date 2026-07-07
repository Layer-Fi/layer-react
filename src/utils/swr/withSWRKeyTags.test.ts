import { describe, expect, it, vi } from 'vitest'

import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'

describe('withSWRKeyTags', () => {
  it('returns false for non-object keys', () => {
    expect(withSWRKeyTags('key', () => true)).toBe(false)
    expect(withSWRKeyTags(42, () => true)).toBe(false)
  })

  it('returns false for null', () => {
    expect(withSWRKeyTags(null, () => true)).toBe(false)
  })

  it('returns false when the key has no tags', () => {
    expect(withSWRKeyTags({ businessId: 'b1' }, () => true)).toBe(false)
  })

  it('returns false when tags is not a string array', () => {
    expect(withSWRKeyTags({ tags: [1, 2] }, () => true)).toBe(false)
    expect(withSWRKeyTags({ tags: 'Widgets' }, () => true)).toBe(false)
  })

  it('invokes the predicate with the tags and the key when tags is a string array', () => {
    const key = { tags: ['Widgets'], businessId: 'b1' }
    const predicate = vi.fn(() => true)

    expect(withSWRKeyTags(key, predicate)).toBe(true)
    expect(predicate).toHaveBeenCalledWith({ tags: ['Widgets'], key })
  })

  it('returns the predicate result', () => {
    const key = { tags: ['Widgets'] }
    expect(withSWRKeyTags(key, ({ tags }) => tags.includes('Other'))).toBe(false)
    expect(withSWRKeyTags(key, ({ tags }) => tags.includes('Widgets'))).toBe(true)
  })
})

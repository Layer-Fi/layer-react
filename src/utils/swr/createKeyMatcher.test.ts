import { unstable_serialize } from 'swr'
import { describe, expect, it, vi } from 'vitest'

import { createKeyMatcher } from '@utils/swr/createKeyMatcher'

type Params = { businessId: string, status?: string }

const matchesParams = createKeyMatcher<Params, Params>([
  { key: 'businessId' },
  { key: 'status' },
])

describe('createKeyMatcher — object keys', () => {
  it('matches when every configured param is equal', () => {
    expect(matchesParams({ businessId: 'b1', status: 'open' }, { businessId: 'b1', status: 'open' })).toBe(true)
  })

  it('does not match when a configured param differs', () => {
    expect(matchesParams({ businessId: 'b1', status: 'open' }, { businessId: 'b2', status: 'open' })).toBe(false)
  })

  it('matches when a param is undefined on both sides', () => {
    expect(matchesParams({ businessId: 'b1' }, { businessId: 'b1' })).toBe(true)
  })

  it('uses a custom compare function when provided', () => {
    const compare = vi.fn(() => true)
    const looseMatch = createKeyMatcher<Params, Params>([{ key: 'businessId', compare }])

    expect(looseMatch({ businessId: 'b1' }, { businessId: 'b2' })).toBe(true)
    expect(compare).toHaveBeenCalledWith('b1', 'b2')
  })
})

describe('createKeyMatcher — serialized string keys', () => {
  it('matches when the serialized key contains every configured param', () => {
    const key = unstable_serialize({ businessId: 'b1', status: 'open', extra: 'x' })
    expect(matchesParams(key, { businessId: 'b1', status: 'open' })).toBe(true)
  })

  it('does not match when a configured param value differs in the serialized key', () => {
    const key = unstable_serialize({ businessId: 'b1', status: 'closed' })
    expect(matchesParams(key, { businessId: 'b1', status: 'open' })).toBe(false)
  })

  it('matches an undefined param only when the key omits that param', () => {
    const withStatus = unstable_serialize({ businessId: 'b1', status: 'open' })
    const withoutStatus = unstable_serialize({ businessId: 'b1' })

    expect(matchesParams(withStatus, { businessId: 'b1' })).toBe(false)
    expect(matchesParams(withoutStatus, { businessId: 'b1' })).toBe(true)
  })
})

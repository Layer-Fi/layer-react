import { type Cache } from 'swr'
import { describe, expect, it } from 'vitest'

import { getRelevantCacheKeys } from '@utils/swr/getRelevantCacheKeys'
import { type CacheKeyInfo } from '@utils/swr/withSWRKeyTags'

/** Minimal SWR-cache stand-in backed by a plain record of state objects. */
const makeCache = (entries: Record<string, unknown>) =>
  ({
    keys: () => Object.keys(entries),
    get: (key: string) => entries[key],
  } as unknown as Cache<unknown>)

const matchesWidgets = ({ tags }: CacheKeyInfo) => tags.includes('Widgets')

describe('getRelevantCacheKeys', () => {
  it('returns keys whose object key tags satisfy the predicate', () => {
    const cache = makeCache({
      'key-a': { _k: { tags: ['Widgets'], businessId: 'b1' }, data: {} },
      'key-b': { _k: { tags: ['Other'], businessId: 'b1' }, data: {} },
    })

    expect(getRelevantCacheKeys({ cache, predicate: matchesWidgets })).toEqual(['key-a'])
  })

  it('skips cache entries that have no key metadata', () => {
    const cache = makeCache({
      'key-a': { data: {} },
      'key-b': { _k: { tags: ['Widgets'] }, data: {} },
    })

    expect(getRelevantCacheKeys({ cache, predicate: matchesWidgets })).toEqual(['key-b'])
  })

  it('parses tags out of infinite ($inf$) string keys', () => {
    const cache = makeCache({
      'inf-a': { _k: '$inf$#businessId:"b1",tags:@"Widgets",,', data: [] },
      'inf-b': { _k: '$inf$#businessId:"b1",tags:@"Other",,', data: [] },
    })

    expect(getRelevantCacheKeys({ cache, predicate: matchesWidgets })).toEqual(['inf-a'])
  })

  it('flags matched infinite queries for full revalidation by setting _i', () => {
    const state = { _k: '$inf$tags:@"Widgets",,', _i: false, data: [] }
    const cache = makeCache({ 'inf-a': state })

    getRelevantCacheKeys({ cache, predicate: matchesWidgets })

    expect(state._i).toBe(true)
  })

  it('does not set _i when withPrecedingOptimisticUpdate is true', () => {
    const state = { _k: '$inf$tags:@"Widgets",,', _i: false, data: [] }
    const cache = makeCache({ 'inf-a': state })

    const keys = getRelevantCacheKeys({ cache, predicate: matchesWidgets, withPrecedingOptimisticUpdate: true })

    expect(keys).toEqual(['inf-a'])
    expect(state._i).toBe(false)
  })
})

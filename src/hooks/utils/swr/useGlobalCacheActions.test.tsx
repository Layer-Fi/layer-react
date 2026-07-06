import { renderHook } from '@testing-library/react'
import { type Cache, useSWRConfig } from 'swr'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type CacheKeyInfo } from '@utils/swr/withSWRKeyTags'
import { useGlobalCacheActions } from '@hooks/utils/swr/useGlobalCacheActions'

// The hook only consumes useSWRConfig from swr, so a minimal mock suffices.
vi.mock('swr', () => ({ useSWRConfig: vi.fn() }))

const mockedUseSWRConfig = vi.mocked(useSWRConfig)

const matchesWidgets = ({ tags }: CacheKeyInfo) => tags.includes('Widgets')

/** Cache with one Widgets-tagged key and one that should never match. */
const CACHE = {
  keys: () => ['key-a', 'key-b'],
  get: (key: string) =>
    key === 'key-a'
      ? { _k: { tags: ['Widgets'] }, data: {} }
      : { _k: { tags: ['Other'] }, data: {} },
} as unknown as Cache<unknown>

let mutate: ReturnType<typeof vi.fn>

beforeEach(() => {
  mutate = vi.fn(() => Promise.resolve(undefined))
  mockedUseSWRConfig.mockReturnValue({ mutate, cache: CACHE } as unknown as ReturnType<typeof useSWRConfig>)
})

afterEach(() => vi.restoreAllMocks())

const renderActions = () => renderHook(() => useGlobalCacheActions()).result

describe('useGlobalCacheActions', () => {
  it('invalidate revalidates only the matching keys without populating the cache', async () => {
    const result = renderActions()

    await result.current.invalidate(matchesWidgets)

    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate).toHaveBeenCalledWith('key-a', undefined, { revalidate: true, populateCache: false })
  })

  it('patchCache writes the transform and revalidates by default', async () => {
    const result = renderActions()
    const transform = (data?: unknown) => data

    await result.current.patchCache(matchesWidgets, transform)

    expect(mutate).toHaveBeenCalledWith('key-a', transform, { populateCache: true, revalidate: true })
  })

  it('patchCache honors withRevalidate: false', async () => {
    const result = renderActions()
    const transform = (data?: unknown) => data

    await result.current.patchCache(matchesWidgets, transform, { withRevalidate: false })

    expect(mutate).toHaveBeenCalledWith('key-a', transform, { populateCache: true, revalidate: false })
  })

  it('forceReload repopulates and revalidates the matching keys', async () => {
    const result = renderActions()

    await result.current.forceReload(matchesWidgets)

    expect(mutate).toHaveBeenCalledWith('key-a', undefined, { populateCache: true, revalidate: true })
  })

  it('optimisticUpdate applies the callback only to displayed data', async () => {
    const result = renderActions()

    await result.current.optimisticUpdate<{ id: string, patched?: boolean }>(
      matchesWidgets,
      displayed => ({ ...displayed, patched: true }),
    )

    const options = mutate.mock.calls[0][2] as {
      optimisticData: (current: unknown, displayed?: { id: string }) => unknown
      populateCache: boolean
      revalidate: boolean
    }
    expect(options.populateCache).toBe(false)
    expect(options.revalidate).toBe(false)
    expect(options.optimisticData(undefined, { id: 'x' })).toEqual({ id: 'x', patched: true })
    expect(options.optimisticData(undefined, undefined)).toBeUndefined()
  })

  it('does not mutate when no keys match the predicate', async () => {
    const result = renderActions()

    await result.current.invalidate(({ tags }) => tags.includes('Nonexistent'))

    expect(mutate).not.toHaveBeenCalled()
  })
})

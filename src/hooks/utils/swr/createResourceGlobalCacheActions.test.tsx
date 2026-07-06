import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { type CacheKeyInfo } from '@utils/swr/withSWRKeyTags'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'
import { useGlobalCacheActions } from '@hooks/utils/swr/useGlobalCacheActions'

vi.mock('@hooks/utils/swr/useGlobalCacheActions', () => ({ useGlobalCacheActions: vi.fn() }))

const mockedUseGlobalCacheActions = vi.mocked(useGlobalCacheActions)

type Predicate = (info: CacheKeyInfo) => boolean
type Transform = (data?: unknown) => unknown

type InvalidateFn = (predicate: Predicate, options?: unknown) => Promise<unknown[]>
type PatchFn = (predicate: Predicate, transform: Transform, options?: unknown) => Promise<unknown[]>
type ForceReloadFn = (predicate: Predicate) => Promise<unknown[]>

let invalidate: Mock<InvalidateFn>
let patchCache: Mock<PatchFn>
let forceReload: Mock<ForceReloadFn>

beforeEach(() => {
  invalidate = vi.fn<InvalidateFn>()
  patchCache = vi.fn<PatchFn>()
  forceReload = vi.fn<ForceReloadFn>()
  mockedUseGlobalCacheActions.mockReturnValue({
    invalidate,
    patchCache,
    forceReload,
  } as unknown as ReturnType<typeof useGlobalCacheActions>)
})

afterEach(() => vi.restoreAllMocks())

/** The predicate the actions pass to the underlying cache actions should match by tag. */
const expectMatchesTag = (predicate: Predicate, tagKey: string) => {
  expect(predicate({ tags: [tagKey], key: 'k' })).toBe(true)
  expect(predicate({ tags: ['SomethingElse'], key: 'k' })).toBe(false)
}

type Widget = { id: string, name: string }

describe('createResourceGlobalCacheActions', () => {
  const renderResourceActions = () =>
    renderHook(() => createResourceGlobalCacheActions<Widget>('Widgets')()).result

  it('invalidate delegates with a tag predicate and forwards options', () => {
    const result = renderResourceActions()
    void result.current.invalidate({ withPrecedingOptimisticUpdate: true })

    expect(invalidate).toHaveBeenCalledTimes(1)
    expectMatchesTag(invalidate.mock.calls[0][0], 'Widgets')
    expect(invalidate.mock.calls[0][1]).toEqual({ withPrecedingOptimisticUpdate: true })
  })

  it('forceReload delegates with a tag predicate', () => {
    const result = renderResourceActions()
    void result.current.forceReload()

    expectMatchesTag(forceReload.mock.calls[0][0], 'Widgets')
  })

  it('overwriteCache patches with a constant transform returning the new data', () => {
    const result = renderResourceActions()
    const next: Widget = { id: 'w1', name: 'New' }
    void result.current.overwriteCache(next, { withRevalidate: false })

    const [predicate, transform, options] = patchCache.mock.calls[0]
    expectMatchesTag(predicate, 'Widgets')
    expect(transform()).toBe(next)
    expect(options).toEqual({ withRevalidate: false })
  })

  it('patchCache forwards the caller transform', () => {
    const result = renderResourceActions()
    const transform = (w?: Widget) => w
    void result.current.patchCache(transform)

    const [predicate, forwarded] = patchCache.mock.calls[0]
    expectMatchesTag(predicate, 'Widgets')
    expect(forwarded).toBe(transform)
  })
})

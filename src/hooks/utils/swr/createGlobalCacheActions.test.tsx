import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { type CacheKeyInfo } from '@utils/swr/withSWRKeyTags'
import {
  createInfiniteQueryGlobalCacheActions,
  createResourceGlobalCacheActions,
} from '@hooks/utils/swr/createGlobalCacheActions'
import { useGlobalCacheActions } from '@hooks/utils/swr/useGlobalCacheActions'

vi.mock('@hooks/utils/swr/useGlobalCacheActions', () => ({ useGlobalCacheActions: vi.fn() }))

const mockedUseGlobalCacheActions = vi.mocked(useGlobalCacheActions)

type Predicate = (info: CacheKeyInfo) => boolean
type Transform = (data?: unknown) => unknown

type InvalidateFn = (predicate: Predicate, options?: unknown) => Promise<unknown[]>
type PatchFn = (predicate: Predicate, transform: Transform, options?: unknown) => Promise<unknown[]>
type OptimisticFn = (predicate: Predicate, transform: Transform) => Promise<unknown[]>
type ForceReloadFn = (predicate: Predicate) => Promise<unknown[]>

let invalidate: Mock<InvalidateFn>
let patchCache: Mock<PatchFn>
let optimisticUpdate: Mock<OptimisticFn>
let forceReload: Mock<ForceReloadFn>

beforeEach(() => {
  invalidate = vi.fn<InvalidateFn>()
  patchCache = vi.fn<PatchFn>()
  optimisticUpdate = vi.fn<OptimisticFn>()
  forceReload = vi.fn<ForceReloadFn>()
  mockedUseGlobalCacheActions.mockReturnValue({
    invalidate,
    patchCache,
    optimisticUpdate,
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

describe('createInfiniteQueryGlobalCacheActions', () => {
  const renderInfiniteActions = () =>
    renderHook(() => createInfiniteQueryGlobalCacheActions<Widget>('Widgets')()).result

  const upper = (w: Widget): Widget => ({ ...w, name: w.name.toUpperCase() })

  it('invalidate and forceReload delegate with a tag predicate', () => {
    const result = renderInfiniteActions()
    void result.current.invalidate()
    void result.current.forceReload()

    expectMatchesTag(invalidate.mock.calls[0][0], 'Widgets')
    expectMatchesTag(forceReload.mock.calls[0][0], 'Widgets')
  })

  it('patchByTransformation maps every item across array-of-pages', () => {
    const result = renderInfiniteActions()
    void result.current.patchByTransformation(upper)

    const [predicate, transform] = patchCache.mock.calls[0]
    expectMatchesTag(predicate, 'Widgets')

    const pages = [{ data: [{ id: 'w1', name: 'a' }] }, { data: [{ id: 'w2', name: 'b' }] }]
    expect(transform(pages)).toEqual([
      { data: [{ id: 'w1', name: 'A' }] },
      { data: [{ id: 'w2', name: 'B' }] },
    ])
  })

  it('patchByTransformation handles a single page and passes through null/undefined', () => {
    const result = renderInfiniteActions()
    void result.current.patchByTransformation(upper)

    const [, transform] = patchCache.mock.calls[0]
    expect(transform({ data: [{ id: 'w1', name: 'a' }] })).toEqual({ data: [{ id: 'w1', name: 'A' }] })
    expect(transform(null)).toBeNull()
    expect(transform(undefined)).toBeUndefined()
  })

  it('patchByKey only replaces the item whose id matches', () => {
    const result = renderInfiniteActions()
    const updated: Widget = { id: 'w2', name: 'Updated' }
    void result.current.patchByKey(updated)

    const [, transform] = patchCache.mock.calls[0]
    const pages = [{ data: [{ id: 'w1', name: 'a' }, { id: 'w2', name: 'b' }] }]
    expect(transform(pages)).toEqual([
      { data: [{ id: 'w1', name: 'a' }, updated] },
    ])
  })

  it('optimisticallyUpdate delegates to optimisticUpdate with a mapping transform', () => {
    const result = renderInfiniteActions()
    void result.current.optimisticallyUpdate(upper)

    const [predicate, transform] = optimisticUpdate.mock.calls[0]
    expectMatchesTag(predicate, 'Widgets')
    expect(transform([{ data: [{ id: 'w1', name: 'a' }] }])).toEqual([{ data: [{ id: 'w1', name: 'A' }] }])
  })
})

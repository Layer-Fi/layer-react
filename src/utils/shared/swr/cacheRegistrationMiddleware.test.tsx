import { type PropsWithChildren, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { act, render, screen } from '@testing-library/react'
import useSWR, { SWRConfig } from 'swr'
import { initCache, SWRGlobalState } from 'swr/_internal'
import { describe, expect, it, vi } from 'vitest'

import { cacheRegistrationMiddleware, RELEASE_INDEX, releaseCacheRegistration } from '@utils/shared/swr/cacheRegistrationMiddleware'

function IsolatedCacheProvider({ children, withMiddleware }: PropsWithChildren<{ withMiddleware: boolean }>) {
  const [cache] = useState(() => new Map())
  const provider = useCallback(() => cache, [cache])
  const swrConfig = useMemo(
    () => ({ use: withMiddleware ? [cacheRegistrationMiddleware] : [], provider }),
    [provider, withMiddleware],
  )

  useEffect(() => () => releaseCacheRegistration(cache), [cache])

  return <SWRConfig value={swrConfig}>{children}</SWRConfig>
}

function Consumer({ label = 'key' }: { label?: string }) {
  const { data } = useSWR(label, () => Promise.resolve(`value:${label}`))
  return <div>{data ?? 'pending'}</div>
}

function createSuspender() {
  let resolve: () => void = () => {}
  let resolved = false
  const promise = new Promise<void>((res) => {
    resolve = () => {
      resolved = true
      res()
    }
  })

  return {
    promise,
    resolve,
    Suspender: ({ suspend }: { suspend: boolean }) => {
      if (suspend && !resolved) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- how React signals suspension
        throw promise
      }
      return null
    },
  }
}

describe('cacheRegistrationMiddleware', () => {
  it('still finds the teardown function at the tuple position it assumes', () => {
    const probe = new Map()
    const teardown = initCache(probe)?.[RELEASE_INDEX]

    expect(typeof teardown).toBe('function')

    // The teardown is identified by removing the registration; the runtime guard in the
    // middleware relies on this to detect an swr release that reorders the tuple.
    ;(teardown as () => void)()
    expect(SWRGlobalState.has(probe)).toBe(false)
  })

  it('leaves no event listeners behind across repeated hide/reveal cycles', async () => {
    const added: string[] = []
    const removed: string[] = []

    vi.spyOn(document, 'addEventListener').mockImplementation((type, ...rest) => {
      added.push(String(type))
      return EventTarget.prototype.addEventListener.call(document, type, ...rest)
    })
    vi.spyOn(document, 'removeEventListener').mockImplementation((type, ...rest) => {
      removed.push(String(type))
      return EventTarget.prototype.removeEventListener.call(document, type, ...rest)
    })

    let resolveCurrent: (() => void) | undefined
    let generation = 0

    function Suspender({ suspend, gen }: { suspend: boolean, gen: number }) {
      if (suspend && gen === generation) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- how React signals suspension
        throw new Promise<void>((res) => {
          resolveCurrent = () => {
            generation++
            res()
          }
        })
      }
      return null
    }

    function App({ suspend, gen }: { suspend: boolean, gen: number }) {
      return (
        <Suspense fallback={<div>loading</div>}>
          <Suspender suspend={suspend} gen={gen} />
          <IsolatedCacheProvider withMiddleware>
            <Consumer />
          </IsolatedCacheProvider>
        </Suspense>
      )
    }

    const { rerender, unmount } = render(<App suspend={false} gen={0} />)
    expect(await screen.findByText('value:key')).toBeTruthy()

    const liveAfterCycle: number[] = []
    for (let cycle = 0; cycle < 3; cycle++) {
      rerender(<App suspend gen={generation} />)
      await act(async () => {
        resolveCurrent?.()
        await Promise.resolve()
      })
      rerender(<App suspend={false} gen={generation} />)
      expect(await screen.findByText('value:key')).toBeTruthy()

      liveAfterCycle.push(
        added.filter(type => type === 'visibilitychange').length
        - removed.filter(type => type === 'visibilitychange').length,
      )
    }

    // Fail rather than pass vacuously if swr stops registering document listeners and this
    // stops measuring anything.
    expect(liveAfterCycle[0]).toBeGreaterThan(0)

    // The count itself depends on which events swr's focus preset registers; what matters is
    // that re-registering does not add a set per cycle.
    expect(new Set(liveAfterCycle).size).toBe(1)

    unmount()

    const liveAfterUnmount = added.filter(type => type === 'visibilitychange').length
      - removed.filter(type => type === 'visibilitychange').length
    expect(liveAfterUnmount).toBeLessThanOrEqual(0)
  })

  it('keeps a per-mount cache provider usable when a Suspense boundary above it re-suspends', async () => {
    const { promise, resolve, Suspender } = createSuspender()

    function App({ suspend }: { suspend: boolean }) {
      return (
        <Suspense fallback={<div>loading</div>}>
          <Suspender suspend={suspend} />
          <IsolatedCacheProvider withMiddleware>
            <Consumer />
          </IsolatedCacheProvider>
        </Suspense>
      )
    }

    const { rerender } = render(<App suspend={false} />)
    expect(await screen.findByText('value:key')).toBeTruthy()

    rerender(<App suspend />)
    expect(screen.getByText('loading')).toBeTruthy()

    await act(async () => {
      resolve()
      await promise
    })

    expect(await screen.findByText('value:key')).toBeTruthy()
  })

  it('keeps a newly mounted SWR hook working while the subtree is hidden', async () => {
    const { promise, resolve, Suspender } = createSuspender()

    function App({ suspend, extraConsumer }: { suspend: boolean, extraConsumer: boolean }) {
      return (
        <Suspense fallback={<div>loading</div>}>
          <Suspender suspend={suspend} />
          <IsolatedCacheProvider withMiddleware>
            <Consumer />
            {extraConsumer ? <Consumer label='late' /> : null}
          </IsolatedCacheProvider>
        </Suspense>
      )
    }

    const { rerender } = render(<App suspend={false} extraConsumer={false} />)
    expect(await screen.findByText('value:key')).toBeTruthy()

    rerender(<App suspend extraConsumer={false} />)
    rerender(<App suspend extraConsumer />)

    await act(async () => {
      resolve()
      await promise
    })

    expect(await screen.findByText('value:late')).toBeTruthy()
  })

  it('documents the underlying SWR behavior without the middleware', async () => {
    const { promise, resolve, Suspender } = createSuspender()

    function App({ suspend }: { suspend: boolean }) {
      return (
        <Suspense fallback={<div>loading</div>}>
          <Suspender suspend={suspend} />
          <IsolatedCacheProvider withMiddleware={false}>
            <Consumer />
          </IsolatedCacheProvider>
        </Suspense>
      )
    }

    const { rerender } = render(<App suspend={false} />)
    expect(await screen.findByText('value:key')).toBeTruthy()

    rerender(<App suspend />)

    await expect(act(async () => {
      resolve()
      await promise
    })).rejects.toThrow(/is not iterable/)
  })
})

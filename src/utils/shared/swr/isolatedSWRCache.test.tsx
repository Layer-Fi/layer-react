import { type PropsWithChildren, Suspense, useMemo } from 'react'
import { act, render, screen } from '@testing-library/react'
import useSWR, { SWRConfig } from 'swr'
import { initCache, SWRGlobalState } from 'swr/_internal'
import { describe, expect, it, vi } from 'vitest'

import { cacheRegistrationMiddleware, RELEASE_INDEX, useIsolatedCacheProvider } from '@utils/shared/swr/isolatedSWRCache'

// The event swr's focus preset listens on, and so the one that reveals a leaked listener set.
const FOCUS_EVENT = 'visibilitychange'

function IsolatedCacheProvider({ children, withMiddleware }: PropsWithChildren<{ withMiddleware: boolean }>) {
  const provider = useIsolatedCacheProvider()
  const swrConfig = useMemo(
    () => ({ use: withMiddleware ? [cacheRegistrationMiddleware] : [], provider }),
    [provider, withMiddleware],
  )

  return <SWRConfig value={swrConfig}>{children}</SWRConfig>
}

function Consumer({ label = 'key' }: { label?: string }) {
  const { data } = useSWR(label, () => Promise.resolve(`value:${label}`))
  return <div>{data ?? 'pending'}</div>
}

/**
 * A boundary trigger that can suspend more than once — `arm` re-suspends on the next render,
 * `settle` resolves and lets the subtree be revealed.
 */
function createSuspender() {
  let resolved = false
  let resolveCurrent: () => void = () => {}
  let pending: Promise<void>

  function arm() {
    resolved = false
    pending = new Promise<void>((resolve) => {
      resolveCurrent = () => {
        resolved = true
        resolve()
      }
    })
  }
  arm()

  return {
    arm,
    settle: () => act(async () => {
      resolveCurrent()
      await pending
    }),
    Suspender: ({ suspend }: { suspend: boolean }) => {
      if (suspend && !resolved) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- how React signals suspension
        throw pending
      }
      return null
    },
  }
}

describe('isolated SWR cache', () => {
  it('still finds the teardown function at the tuple position it assumes', () => {
    const probe = new Map()
    const teardown = initCache(probe)?.[RELEASE_INDEX]

    expect(typeof teardown).toBe('function')

    // The teardown is identified by removing the registration; the runtime guard in
    // `cacheRegistrationMiddleware` relies on this to detect an swr release that reorders
    // the tuple.
    ;(teardown as () => void)()
    expect(SWRGlobalState.has(probe)).toBe(false)
  })

  it('keeps a per-mount cache provider usable when a Suspense boundary above it re-suspends', async () => {
    const { settle, Suspender } = createSuspender()

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

    await settle()

    expect(await screen.findByText('value:key')).toBeTruthy()
  })

  it('keeps a newly mounted SWR hook working while the subtree is hidden', async () => {
    const { settle, Suspender } = createSuspender()

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

    await settle()

    expect(await screen.findByText('value:late')).toBeTruthy()
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

    const countLive = () =>
      added.filter(type => type === FOCUS_EVENT).length
      - removed.filter(type => type === FOCUS_EVENT).length

    const { arm, settle, Suspender } = createSuspender()

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

    const { rerender, unmount } = render(<App suspend={false} />)
    expect(await screen.findByText('value:key')).toBeTruthy()

    const liveAfterCycle: number[] = []
    for (let cycle = 0; cycle < 3; cycle++) {
      arm()
      rerender(<App suspend />)
      await settle()
      expect(await screen.findByText('value:key')).toBeTruthy()

      liveAfterCycle.push(countLive())
    }

    // Fail rather than pass vacuously if swr stops registering document listeners and this
    // stops measuring anything.
    expect(liveAfterCycle[0]).toBeGreaterThan(0)

    // The count itself depends on which events swr's focus preset registers; what matters is
    // that re-registering does not add a set per cycle.
    expect(new Set(liveAfterCycle).size).toBe(1)

    unmount()
    expect(countLive()).toBeLessThanOrEqual(0)
  })

  it('documents the underlying SWR behavior without the middleware', async () => {
    const { settle, Suspender } = createSuspender()

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

    await expect(settle()).rejects.toThrow(/is not iterable/)
  })
})

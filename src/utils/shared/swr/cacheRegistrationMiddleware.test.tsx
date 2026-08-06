import { type PropsWithChildren, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { act, render, screen } from '@testing-library/react'
import useSWR, { SWRConfig } from 'swr'
import { initCache } from 'swr/_internal'
import { describe, expect, it } from 'vitest'

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
    const cacheContext = initCache(new Map())

    expect(typeof cacheContext?.[RELEASE_INDEX]).toBe('function')
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

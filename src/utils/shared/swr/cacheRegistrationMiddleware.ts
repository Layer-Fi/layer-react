import type { Cache, Middleware, SWRHook } from 'swr'
import { initCache, SWRGlobalState, useSWRConfig } from 'swr/_internal'

const releaseByCache = new WeakMap<Cache, () => void>()

// Position of the teardown function in `initCache`'s tuple. Asserted in tests so an swr
// upgrade that reorders it fails loudly instead of silently leaking event listeners.
export const RELEASE_INDEX = 3

/**
 * `SWRConfig` registers a custom cache provider during render, but unregisters it in a
 * layout-effect cleanup. React fires that cleanup without unmounting whenever a Suspense
 * boundary above the provider re-suspends, and every SWR hook reads the registration during
 * render — so the next render throws before the layout effect can re-register.
 *
 * Re-registering here covers every SWR hook render, including ones that happen while the
 * subtree is hidden.
 *
 * Tracked upstream as vercel/swr#2719, unfixed as of swr 2.5.0.
 */
export const cacheRegistrationMiddleware: Middleware = (useSWRNext: SWRHook) => (key, fetcher, config) => {
  const { cache } = useSWRConfig()

  if (!SWRGlobalState.has(cache)) {
    const release = initCache(cache)?.[RELEASE_INDEX]
    if (typeof release === 'function') {
      releaseByCache.set(cache, release)
    }
  }

  return useSWRNext(key, fetcher, config)
}

/**
 * Releases the focus/reconnect listeners installed by the most recent re-registration.
 * `SWRConfig` only ever releases the listeners from its own initial registration.
 */
export function releaseCacheRegistration(cache: Cache) {
  releaseByCache.get(cache)?.()
  releaseByCache.delete(cache)
}

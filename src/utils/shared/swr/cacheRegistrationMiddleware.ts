import type { Cache, Middleware, SWRHook } from 'swr'
import { initCache, SWRGlobalState, useSWRConfig } from 'swr/_internal'

const releaseByCache = new WeakMap<Cache, () => void>()

// Position of the teardown function in `initCache`'s tuple, as of swr 2.5.0.
export const RELEASE_INDEX = 3

let teardownIndexIsTrusted: boolean | undefined

/**
 * `swr` is externalized in the published build, so consumers resolve their own version and
 * never run our tests. `initCache`'s tuple already grew from 4 entries to 5 in 2.5.0, and a
 * future release could reorder it — calling the wrong entry would be worse than not cleaning
 * up, since a neighbouring entry (`unload`) wipes the cache.
 *
 * So confirm the position against a throwaway cache before trusting it: the teardown is the
 * entry that removes the registration. If that no longer holds we skip release tracking and
 * leave one listener set per hide/reveal behind, rather than calling something destructive.
 */
function canTrustTeardownIndex() {
  if (teardownIndexIsTrusted === undefined) {
    const probe = new Map()
    const teardown = initCache(probe)?.[RELEASE_INDEX]

    if (typeof teardown === 'function') {
      teardown()
      teardownIndexIsTrusted = !SWRGlobalState.has(probe)
    }
    else {
      teardownIndexIsTrusted = false
    }

    SWRGlobalState.delete(probe)
  }

  return teardownIndexIsTrusted
}

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
    if (typeof release === 'function' && canTrustTeardownIndex()) {
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

import { useEffect } from 'react'
import type { Awaitable } from '@internal-types/utility/promises'

type Cleanup = () => Awaitable<void>
type OnMount = () => Awaitable<void | Cleanup>

export function useEffectOnMount(fn: OnMount) {
  useEffect(() => {
    let isMounted = true
    let cleanup: Cleanup | void

    void (async () => {
      try {
        const maybeCleanup = await fn()
        if (isMounted && typeof maybeCleanup === 'function') {
          cleanup = maybeCleanup
        }
      }
      catch (_) { /* empty */ }
    })()

    return () => {
      isMounted = false
      if (cleanup) {
        void cleanup()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

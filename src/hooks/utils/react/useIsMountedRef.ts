import { useEffect, useRef } from 'react'

/**
 * A ref that reads `true` while the component is mounted. Lets work resumed after an `await` check
 * whether the component that started it is still on screen. Set in the effect body as well as its
 * cleanup, so a Strict Mode remount leaves it `true`.
 */
export function useIsMountedRef() {
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return isMountedRef
}

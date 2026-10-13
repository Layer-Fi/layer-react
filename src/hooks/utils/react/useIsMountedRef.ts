import { useEffect, useRef } from 'react'

/** Set in the effect body as well as its cleanup, so a Strict Mode remount leaves it `true`. */
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

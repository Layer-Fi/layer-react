import { useRef } from 'react'

/**
 * Mirrors the latest `value` into a ref, updated during render so reads always see the value
 * from the most recent render. Lets a stable callback read the current value without being
 * recreated when it changes — unlike an effect-based update, which lags until effects flush.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value)
  ref.current = value

  return ref
}

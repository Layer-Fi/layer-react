import { type MutableRefObject, useRef } from 'react'

/**
 * Mirrors the latest `value` into a ref, updated during render so reads always see the value
 * from the most recent render. Lets a stable callback read the current value without being
 * recreated when it changes — unlike an effect-based update, which lags until effects flush.
 *
 * Returns a stable ref, so consumers can safely list it in a hook's dependency array (its
 * identity never changes). `react-hooks/exhaustive-deps` only auto-trusts a literal `useRef`
 * call, so listing it is how you signal to that rule that the dependency is a ref.
 */
export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value)
  ref.current = value

  return ref
}

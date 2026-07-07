import { type MutableRefObject, useRef } from 'react'

/**
 * Mirrors the latest `value` into a stable ref, updated during render. Lets a stable callback
 * read the current value without being recreated when it changes.
 */
export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value)
  ref.current = value

  return ref
}

import { useRef } from 'react'

export function useConstant<T>(createValue: () => T) {
  const ref = useRef<T | null>(null)

  if (ref.current === null) {
    ref.current = createValue()
  }

  return ref.current
}

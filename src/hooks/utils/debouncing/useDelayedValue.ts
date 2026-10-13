import { useEffect, useState } from 'react'

export function useDelayedValue<T>(value: T, delayMs: number) {
  const [delayedValue, setDelayedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDelayedValue(value), delayMs)

    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return delayedValue
}

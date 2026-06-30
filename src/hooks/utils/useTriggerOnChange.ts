import { useEffect, useRef } from 'react'

export function useTriggerOnChange<T>(
  value: T | undefined,
  isEnabled: boolean,
  callback: (data: T | undefined) => void,
) {
  const prevDataRef = useRef<T>()

  useEffect(() => {
    if (
      isEnabled
      && prevDataRef.current !== undefined
      && prevDataRef.current !== value
    ) {
      callback(value)
    }

    prevDataRef.current = value
  }, [value, isEnabled, callback])
}

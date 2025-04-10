import { useEffect, useMemo, useRef } from 'react'
import { debounce } from '../../utils/helpers'

export function useDebounce<F extends (...args: Parameters<F>) => ReturnType<F>>(fn: F) {
  const internalFnRef = useRef(fn)

  useEffect(() => {
    internalFnRef.current = fn
  }, [fn])

  const debouncedCallback = useMemo(() => {
    const internalFn = (...args: Parameters<F>) => {
      internalFnRef.current(...args)
    }

    return debounce(internalFn)
  }, [])

  return debouncedCallback
}

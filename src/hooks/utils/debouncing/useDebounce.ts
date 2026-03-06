import { useEffect, useMemo, useRef } from 'react'
import { debounce } from 'lodash-es'

const DEFAULT_WAIT = 300
const DEFAULT_MAX_WAIT = 2 * DEFAULT_WAIT

export function useDebounce<F extends (...args: Parameters<F>) => ReturnType<F>>(fn: F) {
  const internalFnRef = useRef(fn)

  useEffect(() => {
    internalFnRef.current = fn
  }, [fn])

  const debouncedCallback = useMemo(() => {
    const internalFn = (...args: Parameters<F>) => {
      internalFnRef.current(...args)
    }

    return debounce(
      internalFn,
      DEFAULT_WAIT,
      { maxWait: DEFAULT_MAX_WAIT },
    )
  }, [])

  return debouncedCallback
}

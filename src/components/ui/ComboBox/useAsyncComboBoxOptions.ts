import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import type { AsyncComboBoxFetchOptions, ComboBoxOption } from '@ui/ComboBox/types'

type UseAsyncComboBoxOptionsParameters<T extends ComboBoxOption> = {
  fetchOptions: AsyncComboBoxFetchOptions<T>
}

export function useAsyncComboBoxOptions<T extends ComboBoxOption>({
  fetchOptions,
}: UseAsyncComboBoxOptionsParameters<T>) {
  const { searchQuery, handleInputChange } = useDebouncedSearchInput({
    initialInputState: () => '',
  })

  const [options, setOptions] = useState<ReadonlyArray<T>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [isError, setIsError] = useState(false)

  const nextCursorRef = useRef<string | undefined>(undefined)
  const requestIdRef = useRef(0)
  const isFetchingMoreRef = useRef(false)

  const fetchOptionsRef = useRef(fetchOptions)
  useEffect(() => {
    fetchOptionsRef.current = fetchOptions
  }, [fetchOptions])

  useEffect(() => {
    const requestId = ++requestIdRef.current
    setIsLoading(true)

    void fetchOptionsRef.current({ inputValue: searchQuery })
      .then(({ options, nextCursor }) => {
        if (requestId !== requestIdRef.current) return

        nextCursorRef.current = nextCursor
        setOptions(options)
        setIsError(false)
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return

        setIsError(true)
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return

        setIsLoading(false)
      })
  }, [searchQuery])

  const handleMenuScrollToBottom = useCallback(() => {
    const cursor = nextCursorRef.current

    if (cursor === undefined || isFetchingMoreRef.current) return

    const requestId = requestIdRef.current
    isFetchingMoreRef.current = true
    setIsFetchingMore(true)

    void fetchOptionsRef.current({ inputValue: searchQuery, cursor })
      .then(({ options: additionalOptions, nextCursor }) => {
        if (requestId !== requestIdRef.current) return

        nextCursorRef.current = nextCursor
        setOptions(existingOptions => [...existingOptions, ...additionalOptions])
      })
      .catch(() => {
        /* The unchanged cursor allows a retry on the next scroll */
      })
      .finally(() => {
        isFetchingMoreRef.current = false
        setIsFetchingMore(false)
      })
  }, [searchQuery])

  return useMemo(() => ({
    options,
    isLoading: isLoading || isFetchingMore,
    isError,
    onInputValueChange: handleInputChange,
    onMenuScrollToBottom: handleMenuScrollToBottom,
  }), [
    options,
    isLoading,
    isFetchingMore,
    isError,
    handleInputChange,
    handleMenuScrollToBottom,
  ])
}

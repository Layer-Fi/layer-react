import { useState, useCallback } from 'react'
import { useDebounce } from '@hooks/useDebounce/useDebounce'

type UseDebouncedSearchQueryOptions = {
  initialInputState: string | (() => string)
}

export function useDebouncedSearchInput({
  initialInputState,
}: UseDebouncedSearchQueryOptions) {
  const [inputValue, setInputValue] = useState(initialInputState)
  const [searchQuery, setSearchQuery] = useState(() => inputValue)

  const debouncedSetSearchQuery = useDebounce(
    useCallback(
      (value: string) => { setSearchQuery(value) },
      [],
    ),
  )

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value)

      if (value === '') {
        /*
         * When the input is cleared, we want to clear the search query immediately.
         */
        debouncedSetSearchQuery.cancel()
        setSearchQuery('')

        return
      }

      debouncedSetSearchQuery(value)
    },
    [debouncedSetSearchQuery],
  )

  return {
    inputValue,
    searchQuery,
    handleInputChange,
  }
}

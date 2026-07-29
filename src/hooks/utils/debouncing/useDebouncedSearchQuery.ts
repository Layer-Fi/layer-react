import { useCallback, useState } from 'react'

import { useDebounce } from '@hooks/utils/debouncing/useDebounce'

type UseDebouncedSearchQueryOptions = {
  initialInputState: string | (() => string)
  onSearchQueryChange?: (query: string) => void
}

export interface SearchProps {
  value: string
  onChange: (value: string) => void
}

export function useDebouncedSearchInput({
  initialInputState,
  onSearchQueryChange,
}: UseDebouncedSearchQueryOptions) {
  const [inputValue, setInputValue] = useState(initialInputState)
  const [searchQuery, setSearchQuery] = useState(() => inputValue)

  const commitSearchQuery = useCallback(
    (value: string) => {
      setSearchQuery(value)
      onSearchQueryChange?.(value)
    },
    [onSearchQueryChange],
  )

  const debouncedSetSearchQuery = useDebounce(commitSearchQuery)

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value)

      if (value === '') {
        /*
         * When the input is cleared, we want to clear the search query immediately.
         */
        debouncedSetSearchQuery.cancel()
        commitSearchQuery('')

        return
      }

      debouncedSetSearchQuery(value)
    },
    [debouncedSetSearchQuery, commitSearchQuery],
  )

  return {
    inputValue,
    searchQuery,
    handleInputChange,
  }
}

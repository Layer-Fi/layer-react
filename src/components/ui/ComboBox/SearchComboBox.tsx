import { useMemo } from 'react'

import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import type { ComboBoxOption, SingleSelectComboBoxProps } from '@ui/ComboBox/types'

type UseSearchComboBoxOptions = {
  minQueryLength?: number
}

export function useSearchComboBox({ minQueryLength = 1 }: UseSearchComboBoxOptions = {}) {
  const {
    searchQuery: rawSearchQuery,
    handleInputChange: onSearchQueryChange,
  } = useDebouncedSearchInput({ initialInputState: () => '' })

  const searchQuery = rawSearchQuery.trim()
  const isSearchEnabled = searchQuery.length >= minQueryLength

  return useMemo(
    () => ({ searchQuery, isSearchEnabled, searchComboBoxProps: { onSearchQueryChange } }),
    [searchQuery, isSearchEnabled, onSearchQueryChange],
  )
}

export type SearchComboBoxProps<T extends ComboBoxOption> = Omit<
  SingleSelectComboBoxProps<T>,
  'options' | 'groups' | 'filterOption' | 'onInputValueChange'
> & {
  options: ReadonlyArray<T>
  onSearchQueryChange: (query: string) => void
}

export function SearchComboBox<T extends ComboBoxOption>({
  options,
  onSearchQueryChange,
  ...props
}: SearchComboBoxProps<T>) {
  return (
    <ComboBox
      {...props}
      options={options}
      onInputValueChange={onSearchQueryChange}
      /* Options are filtered server-side; the default filter would hide results
       * matched on fields outside the label. */
      filterOption={null}
    />
  )
}

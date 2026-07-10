import { useMemo } from 'react'

import type { BankTransactionCounterparty } from '@schemas/bankTransactions/base'
import { useListCounterparties } from '@hooks/api/businesses/[business-id]/counterparties/useListCounterparties'
import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { CounterpartyComboBoxOption } from '@components/CategorizationRules/CategorizationRuleForm/counterpartyComboBoxOption'

export const useCounterpartyOptions = (value: BankTransactionCounterparty | null) => {
  const { inputValue, searchQuery, handleInputChange } = useDebouncedSearchInput({ initialInputState: '' })
  const { flattenedData, isLoading, isError } = useListCounterparties({
    q: searchQuery || undefined,
    limit: 50,
  })

  const fetchedOptions = useMemo<ReadonlyArray<CounterpartyComboBoxOption>>(() => {
    if (!flattenedData) return []
    return flattenedData.map(counterparty => new CounterpartyComboBoxOption(counterparty))
  }, [flattenedData])

  const options = useMemo<ReadonlyArray<CounterpartyComboBoxOption>>(() => {
    if (!value) return fetchedOptions
    if (fetchedOptions.some(option => option.value === value.id)) return fetchedOptions
    return [new CounterpartyComboBoxOption(value), ...fetchedOptions]
  }, [fetchedOptions, value])

  const selectedOption = useMemo(() => {
    if (!value) return null
    return options.find(option => option.value === value.id) ?? null
  }, [options, value])

  return {
    inputValue,
    searchQuery,
    handleInputChange,
    options,
    selectedOption,
    isLoading,
    isError,
  }
}

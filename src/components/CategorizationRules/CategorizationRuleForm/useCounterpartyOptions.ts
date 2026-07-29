import { useMemo } from 'react'

import type { BankTransactionCounterparty } from '@schemas/bankTransactions/base'
import { useListCounterparties } from '@hooks/api/businesses/[business-id]/counterparties/useListCounterparties'
import { CounterpartyComboBoxOption } from '@components/CategorizationRules/CategorizationRuleForm/counterpartyComboBoxOption'

export const useCounterpartyOptions = (value: BankTransactionCounterparty | null, searchQuery: string) => {
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

  return useMemo(
    () => ({ options, selectedOption, isLoading, isError }),
    [options, selectedOption, isLoading, isError],
  )
}

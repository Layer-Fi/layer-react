import { useMemo } from 'react'

import type { BankTransactionCounterparty } from '@schemas/bankTransactions/base'
import { useListCounterparties } from '@api/businesses/[business-id]/counterparties/get'
import {
  CounterpartyComboBoxOption,
  type CounterpartyOption,
  TransactionDescriptionComboBoxOption,
} from '@components/CategorizationRules/CategorizationRuleForm/counterpartyComboBoxOption'

type UseCounterpartyOptionsProps = {
  value: BankTransactionCounterparty | null
  searchQuery: string
  transactionDescription?: string | null
}

export const useCounterpartyOptions = ({
  value,
  searchQuery,
  transactionDescription,
}: UseCounterpartyOptionsProps) => {
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

  const selectedOption = useMemo<CounterpartyOption | null>(() => {
    if (!value) {
      return transactionDescription
        ? new TransactionDescriptionComboBoxOption(transactionDescription)
        : null
    }
    return options.find(option => option.value === value.id) ?? null
  }, [options, value, transactionDescription])

  return useMemo(
    () => ({ options, selectedOption, isLoading, isError }),
    [options, selectedOption, isLoading, isError],
  )
}

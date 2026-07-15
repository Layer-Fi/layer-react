import { useCallback, useContext, useMemo } from 'react'

import {
  type BankTransaction,
  DisplayState,
} from '@internal-types/bankTransactions'
import { Direction } from '@internal-types/general'
import { type TagFilterInput } from '@internal-types/tags'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import { type BankTransactionFilters } from '@utils/bankTransactions/shared'
import { useBankTransactions, type UseBankTransactionsOptions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useFilterBankTransactions } from '@hooks/features/bankTransactions/useFilterBankTransactions'
import { usePollBankTransactions } from '@hooks/features/bankTransactions/usePollBankTransactions'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { CategorizationRulesContext } from '@contexts/CategorizationRulesContext/CategorizationRulesContext'

const tagFilterToParams = (tagFilter: TagFilterInput): Pick<UseBankTransactionsOptions, 'tagKey' | 'tagValues'> => {
  if (tagFilter != 'None' && tagFilter.tagValues.length > 0) {
    return {
      tagKey: tagFilter.tagKey,
      tagValues: tagFilter.tagValues.join(','),
    }
  }
  return {}
}

export function bankTransactionFiltersToHookOptions(
  filters?: BankTransactionFilters,
): UseBankTransactionsOptions {
  return {
    categorized: filters?.categorizationStatus
      ? filters.categorizationStatus !== DisplayState.all
        ? filters.categorizationStatus === DisplayState.categorized
        : undefined
      : undefined,
    direction: filters?.direction?.length === 1
      ? filters.direction[0] === Direction.CREDIT || filters.direction[0] === BankTransactionDirection.Credit
        ? 'INFLOW'
        : 'OUTFLOW'
      : undefined,
    query: filters?.query,
    startDate: filters?.dateRange?.startDate,
    endDate: filters?.dateRange?.endDate,
    ...(filters?.tagFilter ? tagFilterToParams(filters.tagFilter) : undefined),
    bankAccountIds: filters?.bankAccountIds?.length ? filters.bankAccountIds.join(',') : undefined,
    sourceAccountIds: filters?.sourceAccountIds?.length ? filters.sourceAccountIds.join(',') : undefined,
    amountMin: filters?.amount?.min != null ? Math.round(filters.amount.min * 100) : undefined,
    amountMax: filters?.amount?.max != null ? Math.round(filters.amount.max * 100) : undefined,
  }
}

export const useAugmentedBankTransactions = () => {
  const { setRuleSuggestion } = useContext(CategorizationRulesContext)
  const { filters } = useBankTransactionsFiltersContext()

  const display = filters?.categorizationStatus ?? DisplayState.categorized
  const shouldHideAfterCategorize = display === DisplayState.review

  const useBankTransactionsOptions = useMemo(
    () => bankTransactionFiltersToHookOptions(filters),
    [filters],
  )

  const {
    data,
    flattenedData: bankTransactions,
    isLoading,
    isError,
    mutate,
    size,
    setSize,
    hasMore,
  } = useBankTransactions(useBankTransactionsOptions)

  usePollBankTransactions({ data, mutate, useBankTransactionsOptions })

  const filteredBankTransactions = useFilterBankTransactions({ data: bankTransactions, filters })

  const updateLocalBankTransactions = useCallback((newBankTransactions: BankTransaction[]) => {
    const transactionsById = new Map(
      newBankTransactions.map(bt => [bt.id, bt]),
    )

    for (const bt of newBankTransactions) {
      if (bt.updateCategorizationRulesSuggestion) {
        setRuleSuggestion(bt.updateCategorizationRulesSuggestion)
      }
    }

    const updatedData = data?.map(page => ({
      ...page,
      data: page.data?.map(bt =>
        transactionsById.get(bt.id) ?? bt,
      ),
    }))

    void mutate(updatedData, { revalidate: false })
  }, [data, mutate, setRuleSuggestion])

  const removeAfterCategorize = useCallback((transactionIds: string[]) => {
    if (shouldHideAfterCategorize) {
      const updatedData = data?.map(page => ({
        ...page,
        data: page.data?.filter(bt => !transactionIds.includes(bt.id)),
      }))
      void mutate(updatedData, { revalidate: false })
    }
  }, [shouldHideAfterCategorize, data, mutate])

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  return useMemo(() => ({
    data: filteredBankTransactions,
    isLoading,
    isError,
    updateLocalBankTransactions,
    shouldHideAfterCategorize,
    removeAfterCategorize,
    useBankTransactionsOptions,
    display,
    fetchMore,
    hasMore,
    mutate,
  }), [
    filteredBankTransactions,
    isLoading,
    isError,
    updateLocalBankTransactions,
    shouldHideAfterCategorize,
    removeAfterCategorize,
    useBankTransactionsOptions,
    display,
    fetchMore,
    hasMore,
    mutate,
  ])
}

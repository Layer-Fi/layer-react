import { useCallback, useContext, useMemo } from 'react'

import {
  type BankTransaction,
  DisplayState,
} from '@internal-types/bankTransactions'
import { Direction } from '@internal-types/general'
import { type TagFilterInput } from '@internal-types/tags'
import { type BankTransactionFilters } from '@utils/bankTransactions/shared'
import { useBankTransactions, type UseBankTransactionsOptions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useFilterBankTransactions } from '@hooks/features/bankTransactions/useFilterBankTransactions'
import { usePollBankTransactions } from '@hooks/features/bankTransactions/usePollBankTransactions'
import { CategorizationRulesContext } from '@contexts/CategorizationRulesContext/CategorizationRulesContext'

const tagFilterToQueryString = (tagFilter: TagFilterInput): string => {
  if (tagFilter != 'None' && tagFilter.tagValues.length > 0) {
    return `tag_key=${tagFilter.tagKey}&tag_values=${tagFilter.tagValues.join(
      ',',
    )}&`
  }
  return ''
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
      ? filters.direction[0] === Direction.CREDIT
        ? 'INFLOW'
        : 'OUTFLOW'
      : undefined,
    query: filters?.query,
    startDate: filters?.dateRange?.startDate,
    endDate: filters?.dateRange?.endDate,
    tagFilterQueryString: filters?.tagFilter ? tagFilterToQueryString(filters.tagFilter) : undefined,
  }
}

export type UseAugmentedBankTransactionsWithFiltersParams = {
  filters: BankTransactionFilters
}

export const useAugmentedBankTransactions = (
  params: UseAugmentedBankTransactionsWithFiltersParams,
) => {
  const { setRuleSuggestion } = useContext(CategorizationRulesContext)

  const { filters } = params

  const display = filters?.categorizationStatus ?? DisplayState.categorized
  const useBankTransactionsOptions = useMemo(
    () => bankTransactionFiltersToHookOptions(filters),
    [filters],
  )

  const {
    data: rawResponseData,
    isLoading,
    isError,
    mutate,
    size,
    setSize,
    hasMore,
  } = useBankTransactions(useBankTransactionsOptions)

  usePollBankTransactions({ mutate, useBankTransactionsOptions })

  const data: BankTransaction[] | undefined = useMemo(() => {
    if (rawResponseData && rawResponseData.length > 0) {
      return rawResponseData
        ?.map(x => x?.data)
        .flat()
        .filter(x => !!x)
    }

    return undefined
  }, [rawResponseData])

  const filteredData = useFilterBankTransactions({ data, filters })

  const updateLocalBankTransactions = useCallback((newBankTransactions: BankTransaction[]) => {
    const transactionsById = new Map(
      newBankTransactions.map(bt => [bt.id, bt]),
    )

    for (const bt of newBankTransactions) {
      if (bt.updateCategorizationRulesSuggestion) {
        setRuleSuggestion(bt.updateCategorizationRulesSuggestion)
      }
    }

    const updatedData = rawResponseData?.map(page => ({
      ...page,
      data: page.data?.map(bt =>
        transactionsById.get(bt.id) ?? bt,
      ),
    }))

    void mutate(updatedData, { revalidate: false })
  }, [rawResponseData, mutate, setRuleSuggestion])

  const shouldHideAfterCategorize = filters?.categorizationStatus === DisplayState.review

  const removeAfterCategorize = useCallback((transactionIds: string[]) => {
    if (shouldHideAfterCategorize) {
      const updatedData = rawResponseData?.map(page => ({
        ...page,
        data: page.data?.filter(bt => !transactionIds.includes(bt.id)),
      }))
      void mutate(updatedData, { revalidate: false })
    }
  }, [shouldHideAfterCategorize, rawResponseData, mutate])

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  return useMemo(() => ({
    data: filteredData,
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
    filteredData,
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

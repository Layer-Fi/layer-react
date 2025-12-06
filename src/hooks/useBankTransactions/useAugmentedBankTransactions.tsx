import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import {
  type BankTransaction,
  DisplayState,
} from '@internal-types/bank_transactions'
import { Direction } from '@internal-types/general'
import { type TagFilterInput } from '@internal-types/tags'
import { decodeRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import {
  type BankTransactionFilters,
} from '@hooks/useBankTransactions/types'
import { useBankTransactions, type UseBankTransactionsOptions } from '@hooks/useBankTransactions/useBankTransactions'
import {
  applyAccountFilter,
  applyAmountFilter,
  applyCategorizationStatusFilter,
} from '@hooks/useBankTransactions/utils'
import { useLinkedAccounts } from '@hooks/useLinkedAccounts/useLinkedAccounts'
import { CategorizationRulesContext } from '@contexts/CategorizationRulesContext/CategorizationRulesContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const INITIAL_POLL_INTERVAL_MS = 1000
const POLL_INTERVAL_AFTER_TXNS_RECEIVED_MS = 5000

const tagFilterToQueryString = (tagFilter: TagFilterInput): string => {
  if (tagFilter != 'None' && tagFilter.tagValues.length > 0) {
    return `tag_key=${tagFilter.tagKey}&tag_values=${tagFilter.tagValues.join(
      ',',
    )}&`
  }
  return ''
}

function useTriggerOnChange(
  data: BankTransaction[] | undefined,
  anyAccountSyncing: boolean,
  callback: (data: BankTransaction[] | undefined) => void,
) {
  const prevDataRef = useRef<BankTransaction[]>()

  useEffect(() => {
    if (
      anyAccountSyncing
      && prevDataRef.current !== undefined
      && prevDataRef.current !== data
    ) {
      callback(data)
    }
    prevDataRef.current = data
  }, [data, anyAccountSyncing, callback])
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
  const { eventCallbacks } = useLayerContext()

  const { setRuleSuggestion } = useContext(CategorizationRulesContext)

  const { filters } = params

  const display = filters?.categorizationStatus ?? DisplayState.categorized

  const {
    data: rawResponseData,
    isLoading,
    isValidating,
    isError,
    mutate,
    size,
    setSize,
    hasMore,
  } = useBankTransactions(
    bankTransactionFiltersToHookOptions(filters),
  )

  const data: BankTransaction[] | undefined = useMemo(() => {
    if (rawResponseData && rawResponseData.length > 0) {
      return rawResponseData
        ?.map(x => x?.data)
        .flat()
        .filter(x => !!x) as unknown as BankTransaction[]
    }

    return undefined
  }, [rawResponseData])

  const filteredData = useMemo(() => {
    let filtered = data

    if (!filtered) {
      return
    }

    if (filters?.categorizationStatus) {
      filtered = applyCategorizationStatusFilter(
        filtered,
        filters.categorizationStatus,
      )
    }

    if (filters?.amount?.min || filters?.amount?.max) {
      filtered = applyAmountFilter(filtered, filters.amount)
    }

    if (filters?.account) {
      filtered = applyAccountFilter(filtered, filters.account)
    }

    return filtered
  }, [filters, data])

  const updateLocalBankTransactions = useCallback((newBankTransactions: BankTransaction[]) => {
    const transactionsById = new Map(
      newBankTransactions.map(bt => [bt.id, bt]),
    )

    for (const bt of newBankTransactions) {
      if (bt.update_categorization_rules_suggestion) {
        const decodedRuleSuggestion = decodeRulesSuggestion(bt.update_categorization_rules_suggestion)
        setRuleSuggestion(decodedRuleSuggestion)
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

  const removeAfterCategorize = (transactionIds: string[]) => {
    if (shouldHideAfterCategorize) {
      const updatedData = rawResponseData?.map(page => ({
        ...page,
        data: page.data?.filter(bt => !transactionIds.includes(bt.id)),
      }))
      void mutate(updatedData, { revalidate: false })
    }
  }

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const { data: linkedAccounts, refetchAccounts } = useLinkedAccounts()
  const anyAccountSyncing = useMemo(
    () => Boolean(linkedAccounts?.some(item => item.is_syncing)),
    [linkedAccounts],
  )

  const [pollIntervalMs, setPollIntervalMs] = useState(
    INITIAL_POLL_INTERVAL_MS,
  )

  const transactionsNotSynced = useMemo(
    () =>
      isLoading === false
      && anyAccountSyncing
      && (!data || data?.length === 0),
    [data, anyAccountSyncing, isLoading],
  )

  const intervalIdRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  // calling `void mutate()` directly in the `setInterval` didn't trigger actual request to API.
  // But it works when called from `useEffect`
  const [refreshTrigger, setRefreshTrigger] = useState(-1)
  useEffect(() => {
    if (refreshTrigger !== -1) {
      void mutate()
      void refetchAccounts()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

  useEffect(() => {
    if (anyAccountSyncing) {
      intervalIdRef.current = setInterval(() => {
        setRefreshTrigger(Math.random())
      }, pollIntervalMs)
    }
    else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [anyAccountSyncing, transactionsNotSynced, pollIntervalMs])

  useTriggerOnChange(data, anyAccountSyncing, (_) => {
    clearInterval(intervalIdRef.current)
    setPollIntervalMs(POLL_INTERVAL_AFTER_TXNS_RECEIVED_MS)
    eventCallbacks?.onTransactionsFetched?.()
  })

  return {
    data: filteredData,
    isLoading,
    isValidating,
    isError,
    updateLocalBankTransactions,
    shouldHideAfterCategorize,
    removeAfterCategorize,
    display,
    fetchMore,
    hasMore,
    mutate,
  }
}

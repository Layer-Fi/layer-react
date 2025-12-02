import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import {
  type BankTransaction,
  DisplayState,
} from '@internal-types/bank_transactions'
import {
  type CategoryUpdate,
} from '@internal-types/categories'
import { Direction } from '@internal-types/general'
import { DataModel } from '@internal-types/general'
import { type TagFilterInput } from '@internal-types/tags'
import { decodeRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import {
  type BankTransactionFilters,
} from '@hooks/useBankTransactions/types'
import { useBankTransactions, type UseBankTransactionsOptions } from '@hooks/useBankTransactions/useBankTransactions'
import { useCategorizeBankTransaction } from '@hooks/useBankTransactions/useCategorizeBankTransaction'
import { useMatchBankTransaction } from '@hooks/useBankTransactions/useMatchBankTransaction'
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

const filtersSettingString = (filters?: BankTransactionFilters): string => {
  return `bank-transactions${
    filters?.categorizationStatus
      ? `-categorizationStatus-${filters.categorizationStatus}`
      : `-categorizationStatus-${DisplayState.all}`
  }${
    filters?.direction?.length === 1
      ? `-direction-${filters.direction.join('-')}`
      : ''
  }${
    filters?.dateRange?.startDate
      ? `-startDate-${filters.dateRange.startDate.toISOString()}`
      : ''
  }${
    filters?.dateRange?.endDate
      ? `-endDate-${filters.dateRange.endDate.toISOString()}`
      : ''
  }${
    filters?.tagFilter ? `--${tagFilterToQueryString(filters.tagFilter)}` : ''
  }`
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
  const {
    addToast,
    touch,
    read,
    syncTimestamps,
    hasBeenTouched,
    eventCallbacks,
  } = useLayerContext()

  const { setRuleSuggestion } = useContext(CategorizationRulesContext)

  const { filters } = params

  const display = filters?.categorizationStatus ?? DisplayState.categorized

  const {
    data: rawResponseData,
    isLoading,
    isValidating,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    error: responseError,
    mutate,
    size,
    setSize,
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

  const lastMetadata = useMemo(() => {
    if (rawResponseData && rawResponseData.length > 0) {
      return rawResponseData[rawResponseData.length - 1].meta
    }

    return undefined
  }, [rawResponseData])

  const hasMore = useMemo(() => {
    if (rawResponseData && rawResponseData.length > 0) {
      const lastElement = rawResponseData[rawResponseData.length - 1]
      return Boolean(
        lastElement.meta?.pagination?.cursor
        && lastElement.meta?.pagination?.has_more,
      )
    }

    return false
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

  const updateOneLocal = (newBankTransaction: BankTransaction) => {
    if (newBankTransaction.update_categorization_rules_suggestion) {
      const decodedRuleSuggestion = decodeRulesSuggestion(newBankTransaction.update_categorization_rules_suggestion)
      setRuleSuggestion(decodedRuleSuggestion)
    }
    const updatedData = rawResponseData?.map((page) => {
      return {
        ...page,
        data: page.data?.map(bt =>
          bt.id === newBankTransaction.id ? newBankTransaction : bt,
        ),
      }
    })

    void mutate(updatedData, { revalidate: false })
  }

  const { trigger: categorizeBankTransaction } = useCategorizeBankTransaction({
    mutateBankTransactions: mutate,
  })

  const categorizeWithOptimisticUpdate = async (
    bankTransactionId: BankTransaction['id'],
    newCategory: CategoryUpdate,
    notify?: boolean,
  ) => {
    const existingTransaction = data?.find(({ id }) => id === bankTransactionId)

    if (existingTransaction) {
      updateOneLocal({ ...existingTransaction, update_categorization_rules_suggestion: undefined, processing: true, error: undefined })
    }

    return categorizeBankTransaction({
      bankTransactionId,
      ...newCategory,
    })
      .then((updatedTransaction) => {
        updateOneLocal({
          ...updatedTransaction,
          processing: false,
          recently_categorized: true,
        })

        if (notify) {
          addToast({ content: 'Transaction confirmed' })
        }
      })
      .catch((error: unknown) => {
        const targetedTransaction = data?.find(({ id }) => id === bankTransactionId)

        if (targetedTransaction) {
          updateOneLocal({
            ...targetedTransaction,
            error: error instanceof Error ? error.message : 'An unknown error occurred',
            processing: false,
          })
        }
      })
      .finally(() => {
        eventCallbacks?.onTransactionCategorized?.()
      })
  }

  const { trigger: matchBankTransaction } = useMatchBankTransaction({
    mutateBankTransactions: mutate,
  })

  const matchWithOptimisticUpdate = async (
    bankTransaction: BankTransaction,
    suggestedMatchId: string,
    notify?: boolean,
  ) => {
    // Get the other side's ID from the bank transaction's match details
    const matchedBankTransactionId = bankTransaction.match?.details?.id

    updateOneLocal({
      ...bankTransaction,
      processing: true,
      error: undefined,
    })

    const matchedBankTransaction = matchedBankTransactionId
      ? data?.find(({ id }) => id === matchedBankTransactionId)
      : undefined

    if (matchedBankTransaction) {
      updateOneLocal({
        ...matchedBankTransaction,
        processing: true,
        error: undefined,
      })
    }

    return matchBankTransaction({
      bankTransactionId: bankTransaction.id,
      match_id: suggestedMatchId,
      type: 'Confirm_Match',
    })
      .then(() => {
        // Remove both transactions after successful match
        const idsToRemove = [bankTransaction.id]
        if (matchedBankTransactionId) {
          idsToRemove.push(matchedBankTransactionId)
        }
        removeAfterCategorize(idsToRemove)

        if (notify) {
          addToast({ content: 'Transaction saved' })
        }
      })
      .catch((error: unknown) => {
        updateOneLocal({
          ...bankTransaction,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
          processing: false,
        })

        if (matchedBankTransaction) {
          updateOneLocal({
            ...matchedBankTransaction,
            error: undefined,
            processing: false,
          })
        }
      })
      .finally(() => {
        eventCallbacks?.onTransactionCategorized?.()
      })
  }

  const shouldHideAfterCategorize = (): boolean => {
    return filters?.categorizationStatus === DisplayState.review
  }

  const removeAfterCategorize = (transactionIds: string[]) => {
    if (shouldHideAfterCategorize()) {
      const updatedData = rawResponseData?.map(page => ({
        ...page,
        data: page.data?.filter(bt => !transactionIds.includes(bt.id)),
      }))
      void mutate(updatedData, { revalidate: false })
    }
  }

  const refetch = () => {
    void mutate()
  }

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const getCacheKey = (txnFilters?: BankTransactionFilters) => {
    return filtersSettingString(txnFilters)
  }

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (isLoading || isValidating) {
      read(DataModel.BANK_TRANSACTIONS, getCacheKey(filters))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isValidating])

  useEffect(() => {
    if (hasBeenTouched(getCacheKey(filters))) {
      refetch()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncTimestamps, filters])

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

  // calling `refetch()` directly in the `setInterval` didn't trigger actual request to API.
  // But it works when called from `useEffect`
  const [refreshTrigger, setRefreshTrigger] = useState(-1)
  useEffect(() => {
    if (refreshTrigger !== -1) {
      refetch()
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
    touch(DataModel.BANK_TRANSACTIONS)
  })

  return {
    data: filteredData,
    metadata: lastMetadata,
    isLoading,
    isValidating,
    refetch,
    isError: !!responseError,
    categorize: categorizeWithOptimisticUpdate,
    match: matchWithOptimisticUpdate,
    updateOneLocal,
    shouldHideAfterCategorize,
    removeAfterCategorize,
    display,
    fetchMore,
    hasMore,
  }
}

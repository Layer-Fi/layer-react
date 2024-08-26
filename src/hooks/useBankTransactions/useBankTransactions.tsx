import { useEffect, useMemo, useRef, useState } from 'react'
import { Layer } from '../../api/layer'
import { ReviewCategories } from '../../components/BankTransactions/constants'
import { useLayerContext } from '../../contexts/LayerContext'
import {
  BankTransaction,
  CategorizationStatus,
  CategoryUpdate,
  Direction,
} from '../../types'
import {
  BankTransactionMatchType,
  DisplayState,
} from '../../types/bank_transactions'
import { DataModel, LoadedStatus } from '../../types/general'
import { useLinkedAccounts } from '../useLinkedAccounts'
import { BankTransactionFilters, UseBankTransactions } from './types'
import {
  applyAccountFilter,
  applyAmountFilter,
  applyCategorizationStatusFilter,
  collectAccounts,
} from './utils'
import useSWRInfinite from 'swr/infinite'

const INITIAL_POLL_INTERVAL_MS = 1000
const POLL_INTERVAL_AFTER_TXNS_RECEIVED_MS = 5000

function useTriggerOnChange(
  data: BankTransaction[] | undefined,
  anyAccountSyncing: boolean,
  callback: (data: BankTransaction[] | undefined) => void,
) {
  const prevDataRef = useRef<BankTransaction[]>()

  useEffect(() => {
    if (
      anyAccountSyncing &&
      prevDataRef.current !== undefined &&
      prevDataRef.current !== data
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
  }`
}

export const useBankTransactions: UseBankTransactions = params => {
  const {
    auth,
    businessId,
    apiUrl,
    addToast,
    touch,
    read,
    syncTimestamps,
    hasBeenTouched,
    eventCallbacks,
  } = useLayerContext()
  const { scope = undefined } = params ?? {}
  const [filters, setTheFilters] = useState<BankTransactionFilters | undefined>(
    scope ? { categorizationStatus: scope } : undefined,
  )
  const display = useMemo(() => {
    if (filters?.categorizationStatus === DisplayState.review) {
      return DisplayState.review
    } else if (filters?.categorizationStatus === DisplayState.all) {
      return DisplayState.all
    }

    return DisplayState.categorized
  }, [filters?.categorizationStatus])

  const [active, setActive] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')

  const getKey = (index: number, prevData: any) => {
    if (!auth?.access_token || !active) {
      return [false, undefined]
    }

    if (index === 0) {
      return [
        businessId &&
          auth?.access_token &&
          `${filtersSettingString(filters)}-${businessId}`,
        undefined,
      ]
    }

    return [
      businessId &&
        auth?.access_token &&
        `${filtersSettingString(filters)}-${businessId}-${prevData?.meta
          ?.pagination?.cursor}`,
      prevData?.meta?.pagination?.cursor.toString(),
    ]
  }

  const {
    data: rawResponseData,
    isLoading,
    isValidating,
    error: responseError,
    mutate,
    size,
    setSize,
  } = useSWRInfinite(
    getKey,
    async ([_query, nextCursor]) => {
      if (auth?.access_token) {
        return Layer.getBankTransactions(apiUrl, auth?.access_token, {
          params: {
            businessId,
            cursor: nextCursor ?? '',
            categorized: filters?.categorizationStatus
              ? filters?.categorizationStatus === DisplayState.categorized
                ? 'true'
                : filters?.categorizationStatus === DisplayState.review
                ? 'false'
                : ''
              : '',
            direction:
              filters?.direction?.length === 1
                ? filters.direction[0] === Direction.CREDIT
                  ? 'INFLOW'
                  : 'OUTFLOW'
                : undefined,
            startDate:
              filters?.dateRange?.startDate?.toISOString() ?? undefined,
            endDate: filters?.dateRange?.endDate?.toISOString() ?? undefined,
          },
        }).call(false)
      }

      return {}
    },
    {
      initialSize: 1,
      revalidateFirstPage: false,
    },
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
        lastElement.meta?.pagination?.cursor &&
          lastElement.meta?.pagination?.has_more,
      )
    }

    return false
  }, [rawResponseData])

  const accountsList = useMemo(
    () => (data ? collectAccounts(data) : []),
    [data],
  )

  useEffect(() => {
    if (isLoading && loadingStatus === 'initial') {
      setLoadingStatus('loading')
      return
    }

    if (!isLoading && loadingStatus === 'loading') {
      setLoadingStatus('complete')
      return
    }
  }, [isLoading])

  const activate = () => {
    setActive(true)
  }

  const setFilters = (value?: Partial<BankTransactionFilters>) => {
    setTheFilters({
      ...filters,
      ...(value ?? {}),
    })
  }

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

  const categorize = (
    id: BankTransaction['id'],
    newCategory: CategoryUpdate,
    notify?: boolean,
  ) => {
    const foundBT = data?.find(x => x.business_id === businessId && x.id === id)
    if (foundBT) {
      updateOneLocal({ ...foundBT, processing: true, error: undefined })
    }

    return Layer.categorizeBankTransaction(apiUrl, auth.access_token, {
      params: { businessId, bankTransactionId: id },
      body: newCategory,
    })
      .then(({ data: newBT, errors }) => {
        if (newBT) {
          newBT.recently_categorized = true
          updateOneLocal(newBT)
        }
        if (errors) {
          console.error(errors)
          throw errors
        }
        if (newBT?.recently_categorized === true && notify) {
          addToast({ content: 'Transaction confirmed' })
        }
      })
      .catch(err => {
        const newBT = data?.find(
          x => x.business_id === businessId && x.id === id,
        )

        if (newBT) {
          updateOneLocal({
            ...newBT,
            error: err.message,
            processing: false,
          })
        }
      })
      .finally(() => {
        touch(DataModel.BANK_TRANSACTIONS)
        eventCallbacks?.onTransactionCategorized?.(id)
      })
  }

  const match = (
    id: BankTransaction['id'],
    matchId: BankTransaction['id'],
    notify?: boolean,
  ) => {
    const foundBT = data?.find(x => x.business_id === businessId && x.id === id)
    if (foundBT) {
      updateOneLocal({ ...foundBT, processing: true, error: undefined })
    }

    return Layer.matchBankTransaction(apiUrl, auth.access_token, {
      params: { businessId, bankTransactionId: id },
      body: { match_id: matchId, type: BankTransactionMatchType.CONFIRM_MATCH },
    })
      .then(({ data: bt, errors }) => {
        const newBT = data?.find(
          x => x.business_id === businessId && x.id === id,
        )

        if (newBT) {
          newBT.recently_categorized = true
          newBT.match = bt
          newBT.categorization_status = CategorizationStatus.MATCHED
          updateOneLocal(newBT)
        }
        if (errors) {
          console.error(errors)
          throw errors
        }

        if (newBT?.recently_categorized === true && notify) {
          addToast({ content: 'Transaction saved' })
        }
      })
      .catch(err => {
        const newBT = data?.find(
          x => x.business_id === businessId && x.id === id,
        )

        if (newBT) {
          updateOneLocal({
            ...newBT,
            error: err.message,
            processing: false,
          })
        }
      })
      .finally(() => {
        touch(DataModel.BANK_TRANSACTIONS)
        eventCallbacks?.onTransactionCategorized?.(id)
      })
  }

  const updateOneLocal = (newBankTransaction: BankTransaction) => {
    const updatedData = rawResponseData?.map(page => {
      return {
        ...page,
        data: page.data?.map(bt =>
          bt.id === newBankTransaction.id ? newBankTransaction : bt,
        ),
      }
    })
    mutate(updatedData, { revalidate: false })
  }

  const shouldHideAfterCategorize = (
    bankTransaction: BankTransaction,
  ): boolean => {
    return filters?.categorizationStatus === DisplayState.review
  }

  const removeAfterCategorize = (bankTransaction: BankTransaction) => {
    if (shouldHideAfterCategorize(bankTransaction)) {
      const updatedData = rawResponseData?.map(page => {
        return {
          ...page,
          data: page.data?.filter(bt => bt.id !== bankTransaction.id),
        }
      })
      mutate(updatedData, { revalidate: false })
    }
  }

  const refetch = () => {
    mutate()
  }

  const fetchMore = () => {
    if (hasMore) {
      setSize(size + 1)
    }
  }

  const getCacheKey = (txnFilters?: BankTransactionFilters) => {
    return filtersSettingString(txnFilters)
  }

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (isLoading || isValidating) {
      read(DataModel.BANK_TRANSACTIONS, getCacheKey(filters))
    }
  }, [isLoading, isValidating])

  useEffect(() => {
    if (hasBeenTouched(getCacheKey(filters))) {
      refetch()
    }
  }, [syncTimestamps, filters])

  const { data: linkedAccounts, refetchAccounts } = useLinkedAccounts()
  const anyAccountSyncing = useMemo(
    () => Boolean(linkedAccounts?.some(item => item.is_syncing)),
    [linkedAccounts],
  )

  const [pollIntervalMs, setPollIntervalMs] = useState(INITIAL_POLL_INTERVAL_MS)

  const transactionsNotSynced = useMemo(
    () =>
      loadingStatus === 'complete' &&
      anyAccountSyncing &&
      (!data || data?.length === 0),
    [data, anyAccountSyncing, loadingStatus],
  )

  let intervalId: ReturnType<typeof setInterval> | undefined = undefined

  // calling `refetch()` directly in the `setInterval` didn't trigger actual request to API.
  // But it works when called from `useEffect`
  const [refreshTrigger, setRefreshTrigger] = useState(-1)
  useEffect(() => {
    if (refreshTrigger !== -1) {
      refetch()
      refetchAccounts()
    }
  }, [refreshTrigger])

  useEffect(() => {
    if (anyAccountSyncing) {
      intervalId = setInterval(() => {
        setRefreshTrigger(Math.random())
      }, pollIntervalMs)
    } else {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [anyAccountSyncing, transactionsNotSynced, pollIntervalMs])

  useTriggerOnChange(data, anyAccountSyncing, newTransactionList => {
    clearInterval(intervalId)
    setPollIntervalMs(POLL_INTERVAL_AFTER_TXNS_RECEIVED_MS)
    eventCallbacks?.onTransactionsFetched?.()
    touch(DataModel.BANK_TRANSACTIONS)
  })

  return {
    data: filteredData,
    metadata: lastMetadata,
    loadingStatus,
    isLoading,
    isValidating,
    refetch,
    error: responseError,
    categorize,
    match,
    updateOneLocal,
    shouldHideAfterCategorize,
    removeAfterCategorize,
    filters,
    setFilters,
    accountsList,
    activate,
    display,
    fetchMore,
    hasMore,
  }
}

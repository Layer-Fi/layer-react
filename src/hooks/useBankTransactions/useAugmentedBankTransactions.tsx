import { useEffect, useMemo, useRef, useState } from 'react'
import { Layer } from '../../api/layer'
import { TagFilterInput } from '../../types/tags'
import { useLayerContext } from '../../contexts/LayerContext'
import {
  BankTransaction,
  CategorizationStatus,
  CategoryUpdate,
} from '../../types'
import {
  BankTransactionMatchType,
  Direction,
  DisplayState,
} from '../../types/bank_transactions'
import { DataModel, LoadedStatus } from '../../types/general'
import { useLinkedAccounts } from '../useLinkedAccounts'
import {
  BankTransactionFilters,
  UseBankTransactionsParams,
} from './types'
import {
  applyAccountFilter,
  applyAmountFilter,
  applyCategorizationStatusFilter,
  collectAccounts,
} from './utils'
import { endOfMonth, startOfMonth } from 'date-fns'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useBankTransactions } from './useBankTransactions'

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

const buildInitialFilters = ({
  scope = undefined,
  monthlyView = false,
}: UseBankTransactionsParams) => {
  let initialFilters = {}
  if (monthlyView) {
    initialFilters = {
      dateRange: {
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      },
    }
  }

  if (scope) {
    initialFilters = {
      ...initialFilters,
      categorizationStatus: scope,
    }
  }

  return initialFilters
}

export const useAugmentedBankTransactions = (
  params?: UseBankTransactionsParams,
) => {
  const {
    businessId,
    addToast,
    touch,
    read,
    syncTimestamps,
    hasBeenTouched,
    eventCallbacks,
  } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [filters, setTheFilters] = useState<BankTransactionFilters | undefined>(
    buildInitialFilters(params ?? {}),
  )
  const display = useMemo(() => {
    if (filters?.categorizationStatus === DisplayState.review) {
      return DisplayState.review
    }
    else if (filters?.categorizationStatus === DisplayState.all) {
      return DisplayState.all
    }

    return DisplayState.categorized
  }, [filters?.categorizationStatus])

  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')

  const {
    data: rawResponseData,
    isLoading,
    isValidating,
    error: responseError,
    mutate,
    size,
    setSize,
  } = useBankTransactions({
    startDate: filters?.dateRange?.startDate,
    endDate: filters?.dateRange?.endDate,
    tagFilterQueryString: filters?.tagFilter ? tagFilterToQueryString(filters.tagFilter) : undefined,
    direction: filters?.direction?.length === 1
      ? filters.direction[0] === Direction.CREDIT
        ? 'INFLOW'
        : 'OUTFLOW'
      : undefined,
    categorized: filters?.categorizationStatus
      ? filters.categorizationStatus !== DisplayState.all
        ? filters.categorizationStatus === DisplayState.categorized
        : undefined
      : undefined,
  })

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
    const foundBT = data?.find(
      x => x.business_id === businessId && x.id === id,
    )
    if (foundBT) {
      updateOneLocal({ ...foundBT, processing: true, error: undefined })
    }

    return Layer.categorizeBankTransaction(apiUrl, auth?.access_token, {
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
      .catch((err) => {
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
    const foundBT = data?.find(
      x => x.business_id === businessId && x.id === id,
    )
    if (foundBT) {
      updateOneLocal({ ...foundBT, processing: true, error: undefined })
    }

    const foundTransferBt = data?.find(
      x => x.id !== id && x?.suggested_matches?.some(sm => sm.id == matchId),
    )
    if (foundTransferBt) {
      updateOneLocal({
        ...foundTransferBt,
        processing: true,
        error: undefined,
      })
    }

    return Layer.matchBankTransaction(apiUrl, auth?.access_token, {
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

        const newTransferBT = data?.find(
          x =>
            x.id !== id && x?.suggested_matches?.some(sm => sm.id == matchId),
        )
        if (newTransferBT) {
          newTransferBT.recently_categorized = true
          newTransferBT.match = bt // This gets the wrong leg of the transfer, but the one we want isn't returned by the api call.
          newTransferBT.categorization_status = CategorizationStatus.MATCHED
          updateOneLocal(newTransferBT)
        }

        if (errors) {
          console.error(errors)
          throw errors
        }

        if (newBT?.recently_categorized === true && notify) {
          addToast({ content: 'Transaction saved' })
        }
      })
      .catch((err) => {
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
    const updatedData = rawResponseData?.map((page) => {
      return {
        ...page,
        data: page.data?.map(bt =>
          bt.id === newBankTransaction.id ? newBankTransaction : bt,
        ),
      }
    })
    mutate(updatedData, { revalidate: false })
  }

  const shouldHideAfterCategorize = (): boolean => {
    return filters?.categorizationStatus === DisplayState.review
  }

  const removeAfterCategorize = (bankTransaction: BankTransaction) => {
    if (shouldHideAfterCategorize()) {
      const updatedData = rawResponseData?.map((page) => {
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

  const [pollIntervalMs, setPollIntervalMs] = useState(
    INITIAL_POLL_INTERVAL_MS,
  )

  const transactionsNotSynced = useMemo(
    () =>
      loadingStatus === 'complete'
      && anyAccountSyncing
      && (!data || data?.length === 0),
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
    }
    else {
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

  useTriggerOnChange(data, anyAccountSyncing, (_) => {
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
    display,
    fetchMore,
    hasMore,
  }
}

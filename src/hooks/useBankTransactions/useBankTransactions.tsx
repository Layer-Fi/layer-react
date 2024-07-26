import { useEffect, useMemo, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import {
  BankTransaction,
  CategorizationStatus,
  CategoryUpdate,
} from '../../types'
import { BankTransactionMatchType, DisplayState } from '../../types/bank_transactions'
import { DataModel, LoadedStatus } from '../../types/general'
import {
  BankTransactionFilters,
  UseBankTransactions,
} from './types'
import {
  applyAccountFilter,
  applyAmountFilter,
  applyCategorizationStatusFilter,
  applyDirectionFilter,
  appplyDateRangeFilter,
  collectAccounts,
} from './utils'
import useSWRInfinite from 'swr/infinite'

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
  } = useLayerContext()
  const { scope = undefined } = params ?? {}
  const [filters, setTheFilters] = useState<BankTransactionFilters | undefined>(
    scope ? { categorizationStatus: scope } : undefined,
  )
  const display = useMemo(() => {
    if (filters?.categorizationStatus === DisplayState.review) {
      return DisplayState.review
    }

    return DisplayState.categorized
  }, [filters?.categorizationStatus])

  const [active, setActive] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')

  const getKey = (_index: number, prevData: any) => {
    if (!auth?.access_token || !active) {
      return [false, undefined]
    }

    if (!prevData?.meta?.pagination?.cursor) {
      return [
        businessId &&
          auth?.access_token &&
          `bank-transactions${
            filters?.categorizationStatus
              ? `-scope-${filters?.categorizationStatus}`
              : ''
          }-${businessId}`,
        undefined,
      ]
    }

    return [
      businessId &&
        auth?.access_token &&
        `bank-transactions${
          filters?.categorizationStatus
            ? `-scope-${filters?.categorizationStatus}`
            : ''
        }-${businessId}-${prevData.meta.pagination.cursor}`,
      prevData.meta.pagination.cursor,
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
    async ([query, nextCursor]) => {
      if (auth?.access_token) {
        return Layer.getBankTransactions(apiUrl, auth?.access_token, {
          params: {
            businessId,
            cursor: nextCursor,
            categorized: filters?.categorizationStatus
              ? filters?.categorizationStatus === DisplayState.categorized
                ? 'true'
                : 'false'
              : '',
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
      return Boolean(lastElement.meta?.pagination?.cursor && lastElement.meta?.pagination?.has_more)
    }

    return false
  }, [rawResponseData])

  const accountsList = useMemo(
    () => data ? collectAccounts(data) : [],
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

    if (filters?.amount?.min || filters?.amount?.max) {
      filtered = applyAmountFilter(filtered, filters.amount)
    }

    if (filters?.account) {
      filtered = applyAccountFilter(filtered, filters.account)
    }

    if (filters?.direction) {
      filtered = applyDirectionFilter(filtered, filters.direction)
    }

    if (filters?.categorizationStatus) {
      filtered = applyCategorizationStatusFilter(
        filtered,
        filters.categorizationStatus,
      )
    }

    if (filters?.dateRange?.startDate || filters?.dateRange?.endDate) {
      filtered = appplyDateRangeFilter(filtered, filters?.dateRange)
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
      .finally(() => touch(DataModel.BANK_TRANSACTIONS))
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
      .finally(() => touch(DataModel.BANK_TRANSACTIONS))
  }

  const updateOneLocal = (newBankTransaction: BankTransaction) => {
    const updatedData = rawResponseData?.map(page => {
      return {
        ...page,
        data: page.data?.map(bt => bt.id === newBankTransaction.id ? newBankTransaction : bt)
      }
    })
    mutate(updatedData, { revalidate: false })
  }

  const removeAfterCategorize = (bankTransaction: BankTransaction) => {
    const updatedData = rawResponseData?.map(page => {
      return {
        ...page,
        data: page.data?.filter(bt => bt.id !== bankTransaction.id)
      }
    })
    mutate(updatedData, { revalidate: false })
  }

  const refetch = () => {
    mutate()
  }

  const fetchMore = () => {
    if (hasMore) {
      setSize(size + 1)
    }
  }

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (isLoading || isValidating) {
      read(DataModel.BANK_TRANSACTIONS)
    }
  }, [isLoading, isValidating])

  useEffect(() => {
    if (hasBeenTouched(DataModel.BANK_TRANSACTIONS)) {
      refetch()
    }
  }, [syncTimestamps])

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
    removeAfterCategorize,
    filters,
    setFilters,
    accountsList,
    activate,
    display,
    fetchMore,
    hasMore
  }
}

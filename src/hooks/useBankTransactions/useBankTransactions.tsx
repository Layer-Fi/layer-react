import { useEffect, useMemo, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import {
  BankTransaction,
  CategorizationScope,
  CategorizationStatus,
  CategoryUpdate,
} from '../../types'
import { BankTransactionMatchType } from '../../types/bank_transactions'
import { DataModel, LoadedStatus } from '../../types/general'
import {
  BankTransactionFilters,
  DisplayState,
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
import useSWRInfinite  from 'swr/infinite'
import { PaginationMetadata } from '../../types/api'

export const useBankTransactions: UseBankTransactions = () => {
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
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')
  const [filters, setTheFilters] = useState<
    BankTransactionFilters | undefined
  >()
  const [active, setActive] = useState(false)
  const display = useMemo(() => {
    if (filters?.categorizationStatus === CategorizationScope.TO_REVIEW) {
      return DisplayState.review
    }

    return DisplayState.categorized
  }, [filters?.categorizationStatus])

  const [pagination, setPagination] = useState<PaginationMetadata | undefined>()
  const [cursor, setCursor] = useState('')

  const queryKey = useMemo(() => {
    if (!active) {
      return false
    }
    return businessId && auth?.access_token && `bank-transactions-${businessId}-${cursor}`
  }, [businessId, auth?.access_token, active, cursor])

  const getKey = (index: number, prevData: any) => {
    console.log('inde', index, prevData, auth?.access_token)
    if (!auth?.access_token) {
      console.log('retrun empty token false')
      return [false, undefined]
    }

    if (!prevData?.meta?.pagination?.cursor) {
      console.log('retrun no cursot')
      return [businessId && auth?.access_token && `bank-transactions-${businessId}`, undefined]
    }

    console.log('retrun curosr')
    return [businessId && auth?.access_token && `bank-transactions-${businessId}-${prevData.meta.pagination.cursor}`, prevData.meta.pagination.cursor]
  }

  // const {
  //   data: responseData,
  //   isLoading,
  //   isValidating,
  //   error: responseError,
  //   mutate,
  // } = useSWRInfinite(
  //   queryKey,
  //   Layer.getBankTransactions(apiUrl, auth?.access_token, {
  //     params: { businessId, cursor },
  //   }),
  // )

  const {
    data: rawResponseData,
    isLoading,
    isValidating,
    error: responseError,
    mutate,
    size,
    setSize
  } = useSWRInfinite(
    getKey,
    async ([query, nextCursor]) => {
      console.log('nextTokjen', query, nextCursor)
      if (auth?.access_token) {
        return Layer.getBankTransactions(apiUrl, auth?.access_token, {
          params: { businessId, cursor: nextCursor },
        }).call()
      }

      return undefined
  },
  { 
    initialSize: 1, 
    revalidateFirstPage : false 
  }
  )

  const responseData = useMemo(() => {
    const r = rawResponseData?.filter(x => Boolean(x))
    console.log('r', rawResponseData)
    if(r && r.length > 0) {
      return { data: r?.map(x => x.data).flat().filter(x => Boolean(x)) }
    }

    return undefined
  }, [rawResponseData])

  console.log('responseData', responseData)

  // console.log('pagination', pagination, 'cursor', cursor)

  // useEffect(() => {
  //   if (responseData?.meta?.pagination) {
  //     setPagination(responseData?.meta?.pagination)
  //   }
  // }, [responseData?.meta])

  const accountsList = useMemo(
    () => collectAccounts(responseData?.data),
    [responseData],
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

  const {
    data = undefined,
    meta: metadata = {},
    error = undefined,
  } = responseData || {}

  const filteredData = useMemo(() => {
    let filtered = data

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
  }, [filters, responseData])

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
    const updatedData = data?.map(bt =>
      bt.id === newBankTransaction.id ? newBankTransaction : bt,
    )
    mutate({ data: updatedData }, { revalidate: false })
  }

  const refetch = () => {
    mutate()
  }

  const fetchNext = () => {
    console.log('fetch next', size)
    setSize(size + 1)
    if (pagination?.cursor) {
      setCursor(pagination?.cursor)
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
    metadata,
    loadingStatus,
    isLoading,
    isValidating,
    refetch,
    error: responseError || error,
    categorize,
    match,
    updateOneLocal,
    filters,
    setFilters,
    accountsList,
    activate,
    display,
    fetchNext
  }
}

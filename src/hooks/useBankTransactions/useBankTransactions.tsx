import { useEffect, useMemo, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { BankTransaction, CategoryUpdate } from '../../types'
import { BankTransactionMatchType } from '../../types/bank_transactions'
import { LoadedStatus } from '../../types/general'
import { BankTransactionFilters, UseBankTransactions } from './types'
import { applyAmountFilter, collectAccounts } from './utils'
import useSWR from 'swr'

export const useBankTransactions: UseBankTransactions = () => {
  const { auth, businessId, apiUrl, addToast, business } = useLayerContext()
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')
  const [filters, setFilters] = useState<BankTransactionFilters | undefined>()
  const [active, setActive] = useState(false)

  const {
    data: responseData,
    isLoading,
    isValidating,
    error: responseError,
    mutate,
  } = useSWR(
    active
      ? businessId && auth?.access_token && `bank-transactions-${businessId}`
      : null,
    Layer.getBankTransactions(apiUrl, auth?.access_token, {
      params: { businessId },
    }),
  )

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
  }
}

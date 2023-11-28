import { Layer } from '../../api/layer'
import { BankTransaction, CategoryUpdate, Metadata } from '../../types'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseBankTransactionsReturn = {
  data: BankTransaction[]
  metadata: Metadata
  isLoading: boolean
  error: unknown
  categorize: (
    id: BankTransaction['id'],
    newCategory: CategoryUpdate,
  ) => Promise<void>
}

export const useBankTransactions = (): UseBankTransactionsReturn => {
  const { auth, businessId } = useLayerContext()

  const {
    data: responseData,
    isLoading,
    error: responseError,
    mutate,
  } = useSWR(
    businessId && auth?.access_token && `bank-transactions-${businessId}`,
    Layer.getBankTransactions(auth?.access_token, { params: { businessId } }),
  )
  const {
    data = [],
    meta: metadata = {},
    error = undefined,
  } = responseData || {}

  const categorize = (id: BankTransaction['id'], newCategory: CategoryUpdate) =>
    Layer.categorizeBankTransaction(auth.access_token, {
      params: { businessId, bankTransactionId: id },
      body: newCategory,
    }).then(({ data: transaction, error }) => {
      if (transaction) {
        mutate()
      }
      if (error) {
        console.error(error)
        throw error
      }
    })

  return { data, metadata, isLoading, error, categorize }
}

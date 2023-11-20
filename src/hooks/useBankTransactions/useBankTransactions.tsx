import { Layer } from '../../api/layer'
import { BankTransaction, CategoryUpdate } from '../../types'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseBankTransactionsReturn = {
  data: ReturnType<typeof Layer.getBankTransactions>
  isLoading: boolean
  error: unknown
  categorize: (
    id: BankTransaction['id'],
    newCategory: CategoryUpdate,
  ) => BankTransaction
}

export const useBankTransactions = (): UseBankTransactionsReturn => {
  const { auth, businessId } = useLayerContext()

  const { data, isLoading, error, mutate } = useSWR(
    businessId && auth?.access_token && `bank-transactions-${businessId}`,
    Layer.getBankTransactions(auth?.access_token, { params: { businessId } }),
  )

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

  return { data, isLoading, error, categorize }
}

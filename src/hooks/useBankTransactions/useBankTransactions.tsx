import { Layer } from '../../api/layer'
import { BankTransaction, CategoryUpdate } from '../../types'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

export const useBankTransactions = () => {
  const { auth, businessId } = useLayerContext()

  const { data, isLoading, error, mutate } = useSWR(
    businessId && auth?.access_token && `bank-transactions-${businessId}`,
    Layer.getBankTransactions(auth?.access_token, { params: { businessId } }),
  )

  const categorize = (id: BankTransaction['id'], update: CategoryUpdate) =>
    Layer.categorizeBankTransaction(auth.access_token, {
      params: { businessId, bankTransactionId: id },
      body: update,
    }).then(({ data: transaction, error }) => {
      if (transaction) {
        const index = data?.data.findIndex(
          (transaction: BankTransaction) => transaction.id === transaction.id,
        )
        // 0 will ping false if just checked for truth
        // but it's a valid value, so check typeof
        if (!!data && typeof index === 'number') {
          data.data[index] = {
            ...data.data[index],
            ...transaction,
          }
        }
        mutate(data)
        return data
      }
      if (error) {
        console.error(error)
        throw error
      }
    })

  return { data, isLoading, error, categorize }
}

import Layer from '../../api/layer'
import { BankTransaction } from '../../types'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

export const useBankTransactions = () => {
  const { auth, businessId } = useLayerContext()

  const { data, isLoading, error, mutate } = useSWR(
    businessId && auth?.access_token && `bank-transactions-${businessId}`,
    Layer.getBankTransactions(auth?.access_token, { params: { businessId } }),
  )

  const mutateOne = (
    updated: { id: BankTransaction['id'] } & Partial<BankTransaction>,
  ) => {
    if (data?.data?.length > 0) {
      const index = data.data.findIndex(
        (transaction: BankTransaction) => transaction.id === updated.id,
      )
      data.data[index] = {
        ...data.data[index],
        ...updated,
      }
      mutate(data)
    }
  }

  return { data, isLoading, error, mutateOne }
}

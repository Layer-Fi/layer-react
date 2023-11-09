import Layer from '../../api/layer'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

export const useBankTransactions = () => {
  const { auth, businessId } = useLayerContext()
  return useSWR(
    businessId && auth?.access_token && `bank-transactions-${businessId}`,
    Layer.getBankTransactions(auth?.access_token, { businessId }),
  )
}

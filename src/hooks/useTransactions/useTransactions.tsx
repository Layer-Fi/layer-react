import Layer from '../../api/layer'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

export const useTransactions = () => {
  const { auth, businessId } = useLayerContext()
  return useSWR(
    businessId && auth?.access_token && `transactions-${businessId}`,
    Layer.getTransactions(auth?.access_token, { businessId }),
  )
}

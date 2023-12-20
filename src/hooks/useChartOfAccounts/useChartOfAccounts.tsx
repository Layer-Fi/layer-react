import { Layer } from '../../api/layer'
import { ChartOfAccounts } from '../../types'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseChartOfAccountsReturn = {
  data: ChartOfAccounts | undefined
  isLoading: boolean
  error: unknown
}

export const useChartOfAccounts = (): UseChartOfAccountsReturn => {
  const { auth, businessId } = useLayerContext()

  const { data, isLoading, error } = useSWR(
    businessId && auth?.access_token && `chart-of-accounts-${businessId}`,
    Layer.getChartOfAccounts(auth?.access_token, { params: { businessId } }),
  )

  return { data: data?.data, isLoading, error }
}

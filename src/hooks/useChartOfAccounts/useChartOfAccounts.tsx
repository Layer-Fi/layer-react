import { Layer } from '../../api/layer'
import { AccountAlternate, ChartOfAccounts, NewAccount } from '../../types'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseChartOfAccounts = () => {
  data: ChartOfAccounts | undefined
  isLoading: boolean
  error: unknown
  create: (newAccount: NewAccount) => Promise<AccountAlternate>
}

export const useChartOfAccounts: UseChartOfAccounts = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const { data, isLoading, error, mutate } = useSWR(
    businessId && auth?.access_token && `chart-of-accounts-${businessId}`,
    Layer.getChartOfAccounts(apiUrl, auth?.access_token, {
      params: { businessId },
    }),
  )

  const create = (newAccount: NewAccount) =>
    Layer.createAccount(apiUrl, auth?.access_token, {
      params: { businessId },
      body: newAccount,
    }).then(({ data }) => (mutate(), data))

  return { data: data?.data, isLoading, error, create }
}

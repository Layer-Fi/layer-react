import { Layer } from '../../api/layer'
import { BalanceSheet } from '../../types'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseBalanceSheet = {
  data: BalanceSheet | undefined
  isLoading: boolean
  error: unknown
}

export const useBalanceSheet = (): UseBalanceSheet => {
  const { auth, businessId } = useLayerContext()

  const { data, isLoading, error } = useSWR(
    businessId && auth?.access_token && `balance-sheet-${businessId}`,
    Layer.getBalanceSheet(auth?.access_token, { params: { businessId } }),
  )

  return { data, isLoading, error }
}

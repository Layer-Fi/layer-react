import { useState } from 'react'
import { Layer } from '../../api/layer'
import { ChartOfAccounts } from '../../types'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseLedgerAccounts = () => {
  data: ChartOfAccounts | undefined
  isLoading?: boolean
  isValidating?: boolean
  error?: unknown
  refetch: () => void
  accountId?: string
  setAccountId: (id?: string) => void
}

export const useLedgerAccounts: UseLedgerAccounts = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const [accountId, setAccountId] = useState<string | undefined>()

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    businessId &&
      accountId &&
      auth?.access_token &&
      `ledger-accounts-lines-${businessId}`,
    Layer.getLedgerAccountsLines(apiUrl, auth?.access_token, {
      params: { businessId, accountId },
    }),
  )

  const refetch = () => mutate()

  return {
    data: data?.data,
    isLoading,
    isValidating,
    error,
    refetch,
    accountId,
    setAccountId,
  }
}

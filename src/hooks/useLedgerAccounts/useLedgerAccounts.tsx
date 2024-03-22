import { Layer } from '../../api/layer'
import { AccountAlternate, LedgerAccounts, NewAccount } from '../../types'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseLedgerAccounts = () => {
  data: LedgerAccounts | undefined
  isLoading: boolean
  error: unknown
  create: (newAccount: NewAccount) => Promise<AccountAlternate>
}

export const useLedgerAccounts: UseLedgerAccounts = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const { data, isLoading, error, mutate } = useSWR(
    businessId && auth?.access_token && `ledger-accounts-${businessId}`,
    Layer.getLedgerAccounts(apiUrl, auth?.access_token, {
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

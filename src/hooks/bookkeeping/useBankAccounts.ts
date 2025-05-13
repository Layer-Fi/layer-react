import useSWR from 'swr'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { get } from '../../api/layer/authenticated_http'
import { BankAccount } from '../../types/linked_accounts'

export const BANK_ACCOUNTS_TAG_KEY = '#bank-accounts'

const getBankAccounts = get<{ data: BankAccount[] }, { businessId: string }>(
  ({ businessId }) => `/v1/businesses/${businessId}/bank-accounts`,
)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [BANK_ACCOUNTS_TAG_KEY],
    } as const
  }
}

export const requiresNotification = (bankAccount: BankAccount): boolean =>
  bankAccount.is_disconnected && bankAccount.notify_when_disconnected

export const useBankAccounts = () => {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const { data, error, isLoading } = useSWR(
    () =>
      buildKey({
        ...auth,
        apiUrl,
        businessId,
      }),
    ({ accessToken, apiUrl, businessId }) =>
      getBankAccounts(apiUrl, accessToken, { params: { businessId } })(),
  )

  const disconnectedAccountsRequiringNotification = (data?.data ?? []).filter(
    account => requiresNotification(account),
  ).length

  return {
    bankAccounts: data?.data ?? [],
    isLoading,
    error,
    disconnectedAccountsRequiringNotification,
  }
}

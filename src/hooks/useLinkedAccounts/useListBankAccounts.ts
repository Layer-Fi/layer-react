import useSWR from 'swr'

import { type BankAccount } from '@internal-types/linked_accounts'
import { get } from '@utils/authenticatedHttp'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const BANK_ACCOUNTS_TAG_KEY = '#bank-accounts'

const requiresNotification = (bankAccount: BankAccount): boolean =>
  bankAccount.is_disconnected && bankAccount.notify_when_disconnected

const listBankAccounts = get<
  { data: BankAccount[] },
  {
    businessId: string
  }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-accounts`)

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

export class ListBankAccountsSWRResponse extends SWRQueryResult<BankAccount[]> {
  get error(): unknown {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.swrResponse.error
  }

  get disconnectedAccountsRequiringNotification() {
    return (this.data ?? []).filter(requiresNotification).length
  }
}

export function useListBankAccounts(): ListBankAccountsSWRResponse {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const swrResponse = useSWR(
    () =>
      buildKey({
        ...auth,
        apiUrl,
        businessId,
      }),
    ({ accessToken, apiUrl, businessId }) => listBankAccounts(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )().then(({ data }) => data),
  )

  return new ListBankAccountsSWRResponse(swrResponse)
}

import { Schema } from 'effect'
import useSWR, { type SWRConfiguration } from 'swr'

import { type LoadedStatus } from '@internal-types/general'
import { type BankAccount, BankAccountSchema } from '@schemas/bankAccounts/bankAccount'
import { get } from '@utils/api/authenticatedHttp'
import { isAnyBankAccountSyncing } from '@utils/bankAccount'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const BANK_ACCOUNTS_TAG_KEY = '#bank-accounts'

const ListBankAccountsResponseSchema = Schema.Struct({
  data: Schema.Array(BankAccountSchema),
})

const requiresNotification = (bankAccount: BankAccount): boolean =>
  bankAccount.isDisconnected && bankAccount.notifyWhenDisconnected

const listBankAccounts = get<
  Record<string, unknown>,
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

  get isSyncing() {
    return isAnyBankAccountSyncing(this.data ?? [])
  }

  get loadingStatus(): LoadedStatus {
    if (this.isLoading) {
      return 'loading'
    }

    return this.data !== undefined || this.isError ? 'complete' : 'initial'
  }
}

export function useListBankAccounts(
  config?: SWRConfiguration<BankAccount[]>,
): ListBankAccountsSWRResponse {
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
    )()
      .then(Schema.decodeUnknownPromise(ListBankAccountsResponseSchema))
      .then(({ data }) => [...data]),
    config,
  )

  return new ListBankAccountsSWRResponse(swrResponse)
}

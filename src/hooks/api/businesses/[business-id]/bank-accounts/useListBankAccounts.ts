import { Schema } from 'effect'
import useSWR, { type SWRConfiguration } from 'swr'

import { type LoadedStatus } from '@internal-types/general'
import { type BankAccount, BankAccountSchema } from '@schemas/bankAccounts/bankAccount'
import { get } from '@utils/api/authenticatedHttp'
import { isAnyBankAccountSyncing } from '@utils/bankAccount'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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

const buildKey = createBuildKey<{ businessId: string }>([BANK_ACCOUNTS_TAG_KEY])

export class ListBankAccountsSWRResponse extends SWRQueryResult<BankAccount[]> {
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
  const { businessId, auth } = useBuildKeyInputs()

  const swrResponse = useSWR(
    () =>
      buildKey({
        ...auth,
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

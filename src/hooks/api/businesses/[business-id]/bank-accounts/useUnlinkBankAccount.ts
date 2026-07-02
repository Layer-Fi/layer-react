import useSWRMutation from 'swr/mutation'

import { del } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const UNLINK_BANK_ACCOUNT_TAG_KEY = '#unlink-bank-account'

const unlinkBankAccount = del<
  Record<string, unknown>,
  Record<string, unknown>,
  {
    businessId: string
    bankAccountId: string
  }
>(
  ({ businessId, bankAccountId }) =>
    `/v1/businesses/${businessId}/bank-accounts/${bankAccountId}`,
)

const buildKey = createBuildKey<{ businessId: string }>([UNLINK_BANK_ACCOUNT_TAG_KEY])

export function useUnlinkBankAccount() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
    })),
    ({ accessToken, apiUrl, businessId }, { arg: bankAccountId }: { arg: string }) =>
      unlinkBankAccount(apiUrl, accessToken, {
        params: { businessId, bankAccountId },
      }),
    {
      revalidate: false,
    },
  )

  return new SWRMutationResult(rawMutationResponse)
}

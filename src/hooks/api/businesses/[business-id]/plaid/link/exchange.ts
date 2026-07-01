import useSWRMutation from 'swr/mutation'

import type { PublicToken } from '@internal-types/linkedAccounts'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const EXCHANGE_PLAID_PUBLIC_TOKEN_TAG_KEY = '#exchange-plaid-public-token'

const exchangePlaidPublicToken = post<
  Record<string, unknown>,
  PublicToken,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link/exchange`)

const buildKey = createBuildKey<{ businessId: string }>([EXCHANGE_PLAID_PUBLIC_TOKEN_TAG_KEY])

export function useExchangePlaidPublicToken() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: PublicToken },
    ) => exchangePlaidPublicToken(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body,
      },
    ),
    {
      revalidate: false,
    },
  )

  return new SWRMutationResult(rawMutationResponse)
}

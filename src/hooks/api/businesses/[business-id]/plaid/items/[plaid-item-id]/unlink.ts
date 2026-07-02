import useSWRMutation from 'swr/mutation'

import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const UNLINK_PLAID_ITEM_TAG_KEY = '#unlink-plaid-item'

const unlinkPlaidItem = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string, plaidItemId: string }
>(
  ({ businessId, plaidItemId }) =>
    `/v1/businesses/${businessId}/plaid/items/${plaidItemId}/unlink`,
)

const buildKey = createBuildKey<{ businessId: string }>([UNLINK_PLAID_ITEM_TAG_KEY])

export function useUnlinkPlaidItem() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: { plaidItemId } }: { arg: { plaidItemId: string } },
    ) => unlinkPlaidItem(apiUrl, accessToken, {
      params: { businessId, plaidItemId },
    }),
    {
      revalidate: false,
    },
  )

  return new SWRMutationResult(rawMutationResponse)
}

import useSWRMutation from 'swr/mutation'

import { post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const UNLINK_PLAID_ITEM_TAG_KEY = '#unlink-plaid-item'

const unlinkPlaidItem = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string, plaidItemId: string }
>(
  ({ businessId, plaidItemId }) =>
    `/v1/businesses/${businessId}/plaid/items/${plaidItemId}/unlink`,
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
      tags: [UNLINK_PLAID_ITEM_TAG_KEY],
    } as const
  }
}

export function useUnlinkPlaidItem() {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

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

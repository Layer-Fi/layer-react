import { post } from '@utils/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UNLINK_PLAID_ITEM_TAG_KEY = '#unlink-plaid-item'

const unlinkPlaidItem = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string, plaidItemId: string }
>(
  ({ businessId, plaidItemId }) =>
    `/v1/businesses/${businessId}/plaid/items/${plaidItemId}/unlink`,
)

export const useUnlinkPlaidItem = createMutationHook({
  tags: [UNLINK_PLAID_ITEM_TAG_KEY],
  request: unlinkPlaidItem,
  argToParams: ({ plaidItemId }: { plaidItemId: string }) => ({ plaidItemId }),
  argToBody: () => undefined,
})

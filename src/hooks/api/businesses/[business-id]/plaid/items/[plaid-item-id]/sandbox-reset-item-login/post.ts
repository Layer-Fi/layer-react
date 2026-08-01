import { post } from '@utils/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const BREAK_PLAID_ITEM_CONNECTION_TAG_KEY = '#break-plaid-item-connection'

/**
 * Test utility that puts a Plaid connection into a broken state; only works in
 * non-production environments.
 */
const breakPlaidItemConnection = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string, plaidItemId: string }
>(
  ({ businessId, plaidItemId }) =>
    `/v1/businesses/${businessId}/plaid/items/${plaidItemId}/sandbox-reset-item-login`,
)

export const useBreakPlaidItemConnection = createMutationHook({
  tags: [BREAK_PLAID_ITEM_CONNECTION_TAG_KEY],
  request: breakPlaidItemConnection,
  argToParams: ({ plaidItemId }: { plaidItemId: string }) => ({ plaidItemId }),
  argToBody: () => undefined,
})

import type { PublicToken } from '@internal-types/linkedAccounts'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const EXCHANGE_PLAID_PUBLIC_TOKEN_TAG_KEY = '#exchange-plaid-public-token'

const exchangePlaidPublicToken = post<
  Record<string, unknown>,
  PublicToken,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link/exchange`)

export const usePostExchangePlaidPublicToken = createMutationHook({
  tags: [EXCHANGE_PLAID_PUBLIC_TOKEN_TAG_KEY],
  request: exchangePlaidPublicToken,
})

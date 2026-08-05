import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { ApiPlaidHostedLinkStatusSchema } from '@schemas/features/linkedAccounts/plaidHostedLinkStatus'
import { get } from '@utils/shared/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const PLAID_HOSTED_LINK_TAG_KEY = '#plaid-hosted-link'

const PlaidHostedLinkStatusResponseSchema = UnwrappedDataResponseSchema(
  ApiPlaidHostedLinkStatusSchema,
)

const getPlaidHostedLinkStatus = get<
  typeof PlaidHostedLinkStatusResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/hosted-link`)

export const useGetPlaidHostedLinkStatus = createQueryHook({
  tags: [PLAID_HOSTED_LINK_TAG_KEY],
  request: getPlaidHostedLinkStatus,
  schema: PlaidHostedLinkStatusResponseSchema,
  isLocalized: false,
})

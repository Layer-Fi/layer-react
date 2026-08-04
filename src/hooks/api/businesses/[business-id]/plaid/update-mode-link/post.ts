import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { ApiLinkTokenSchema } from '@schemas/linkedAccounts/plaid'
import { post } from '@utils/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const CREATE_PLAID_UPDATE_MODE_LINK_TAG_KEY = '#create-plaid-update-mode-link'

const CreatePlaidUpdateModeLinkResponseSchema = UnwrappedDataResponseSchema(ApiLinkTokenSchema)

type CreatePlaidUpdateModeLinkBody = {
  plaid_item_id: string
}

const createPlaidUpdateModeLink = post<
  typeof CreatePlaidUpdateModeLinkResponseSchema.Encoded,
  CreatePlaidUpdateModeLinkBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/update-mode-link`)

export const usePostPlaidUpdateModeLink = createMutationHook({
  tags: [CREATE_PLAID_UPDATE_MODE_LINK_TAG_KEY],
  request: createPlaidUpdateModeLink,
  argToBody: ({ plaidItemId }: { plaidItemId: string }) => ({ plaid_item_id: plaidItemId }),
  schema: CreatePlaidUpdateModeLinkResponseSchema,
})

import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type CreatePlaidLinkParams, type CreatePlaidLinkParamsEncoded, encodeCreatePlaidLinkParams } from '@schemas/linkedAccounts/createPlaidLinkParams'
import { ApiLinkTokenSchema } from '@schemas/linkedAccounts/linkToken'
import { post } from '@utils/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const CREATE_PLAID_LINK_TAG_KEY = '#create-plaid-link'

const CreatePlaidLinkResponseSchema = UnwrappedDataResponseSchema(ApiLinkTokenSchema)

const createPlaidLink = post<
  typeof CreatePlaidLinkResponseSchema.Encoded,
  CreatePlaidLinkParamsEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link`)

export const usePostPlaidLink = createMutationHook({
  tags: [CREATE_PLAID_LINK_TAG_KEY],
  request: createPlaidLink,
  argToBody: (params: CreatePlaidLinkParams) => encodeCreatePlaidLinkParams(params),
  schema: CreatePlaidLinkResponseSchema,
})

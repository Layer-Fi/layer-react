import { Schema } from 'effect'

import {
  ApiLinkTokenSchema,
  type CreatePlaidLinkParams,
  type CreatePlaidLinkParamsEncoded,
  encodeCreatePlaidLinkParams,
} from '@schemas/linkedAccounts/plaid'
import { post } from '@utils/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const CREATE_PLAID_LINK_TAG_KEY = '#create-plaid-link'

const CreatePlaidLinkResponseSchema = Schema.transform(
  Schema.Struct({ data: ApiLinkTokenSchema }),
  Schema.typeSchema(ApiLinkTokenSchema),
  {
    strict: true,
    decode: ({ data }) => data,
    encode: data => ({ data }),
  },
)

const createPlaidLink = post<
  typeof CreatePlaidLinkResponseSchema.Encoded,
  CreatePlaidLinkParamsEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link`)

export const useCreatePlaidLink = createMutationHook({
  tags: [CREATE_PLAID_LINK_TAG_KEY],
  request: createPlaidLink,
  argToBody: (params: CreatePlaidLinkParams) => encodeCreatePlaidLinkParams(params),
  schema: CreatePlaidLinkResponseSchema,
})

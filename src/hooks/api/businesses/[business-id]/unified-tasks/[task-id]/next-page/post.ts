import { Schema } from 'effect'

import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import {
  type AskFormNextPageRequest,
  type AskFormNextPageRequestEncoded,
  AskFormNextPageRequestSchema,
  AskFormNextPageResultSchema,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNextPage'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const ASK_FORM_NEXT_PAGE_TAG_KEY = '#ask-form-next-page'

const PostAskFormNextPageReturnSchema = UnwrappedDataResponseSchema(AskFormNextPageResultSchema)

const encodeNextPageRequest = Schema.encodeSync(AskFormNextPageRequestSchema)

const NEXT_PAGE_PATH = /^\/v1\/businesses\/[A-Za-z0-9-]+\/unified-tasks\/[A-Za-z0-9-]+\/next-page(\?.*)?$/

// The form's SERVER route carries the url (the API's next-page endpoint), so it is posted to as given.
// The request carries the user's bearer token, so only a next-page endpoint is accepted.
const postAskFormNextPage = post<
  typeof PostAskFormNextPageReturnSchema.Encoded,
  AskFormNextPageRequestEncoded,
  { businessId: string, url: string }
>(({ url }) => {
  if (!NEXT_PAGE_PATH.test(url)) throw new Error(`Refusing to post an ask form next page to ${url}`)

  return url
})

type UsePostAskFormNextPageArg = {
  url: string
  request: AskFormNextPageRequest
}

export const usePostAskFormNextPage = createMutationHook({
  tags: [ASK_FORM_NEXT_PAGE_TAG_KEY],
  request: postAskFormNextPage,
  schema: PostAskFormNextPageReturnSchema,
  argToParams: ({ url }: UsePostAskFormNextPageArg) => ({ url }),
  argToBody: ({ request }: UsePostAskFormNextPageArg) => encodeNextPageRequest(request),
  swrOptions: { throwOnError: true },
})

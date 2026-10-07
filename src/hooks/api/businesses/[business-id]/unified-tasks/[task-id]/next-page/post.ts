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

// The form's SERVER route carries the url (the API's next-page endpoint), so it is posted to as given.
const postAskFormNextPage = post<
  typeof PostAskFormNextPageReturnSchema.Encoded,
  AskFormNextPageRequestEncoded,
  { businessId: string, url: string }
>(({ url }) => url)

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

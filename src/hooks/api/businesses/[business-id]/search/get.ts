import { type EnumWithUnknownValues } from '@internal-types/utility/enumWithUnknownValues'
import { UnifiedSearchResultsSchema } from '@schemas/common/unifiedSearch'
import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type AskFormSearchEntity } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { getAsMutation } from '@utils/shared/api/getAsMutation'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export const UNIFIED_SEARCH_TAG_KEY = '#unified-search'

const UnifiedSearchResponseSchema = UnwrappedDataResponseSchema(UnifiedSearchResultsSchema)

type GetUnifiedSearchParams = {
  businessId: string
  entity: EnumWithUnknownValues<AskFormSearchEntity>
  q: string
  taskId?: string
  limit?: number
}

const getUnifiedSearch = getWithQuery<
  typeof UnifiedSearchResponseSchema.Encoded,
  GetUnifiedSearchParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/search`,
)

const requestUnifiedSearch = getAsMutation(getUnifiedSearch)

type GetUnifiedSearchArg = Pick<GetUnifiedSearchParams, 'entity' | 'q' | 'taskId'>

export const useGetUnifiedSearch = createMutationHook({
  tags: [UNIFIED_SEARCH_TAG_KEY],
  request: requestUnifiedSearch,
  schema: UnifiedSearchResponseSchema,
  argToParams: ({ entity, q, taskId }: GetUnifiedSearchArg) => ({ entity, q, taskId, limit: 20 }),
  argToBody: (_arg: GetUnifiedSearchArg) => undefined,
  select: ({ results }) => results,
  swrOptions: { throwOnError: true },
})

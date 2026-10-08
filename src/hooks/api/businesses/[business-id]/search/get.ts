import { type EnumWithUnknownValues } from '@internal-types/utility/enumWithUnknownValues'
import { UnifiedSearchResultsSchema } from '@schemas/common/unifiedSearch'
import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type AskFormSearchEntity } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

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

export const useGetUnifiedSearch = createQueryHook({
  tags: [UNIFIED_SEARCH_TAG_KEY],
  request: getUnifiedSearch,
  schema: UnifiedSearchResponseSchema,
  keyDefaults: { limit: 20 },
  select: ({ results }) => results,
  swrOptions: { keepPreviousData: true },
})

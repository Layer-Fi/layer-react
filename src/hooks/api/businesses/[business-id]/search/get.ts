import { UnifiedSearchResultsSchema } from '@schemas/common/unifiedSearch'
import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const UNIFIED_SEARCH_TAG_KEY = '#unified-search'

const UnifiedSearchResponseSchema = UnwrappedDataResponseSchema(UnifiedSearchResultsSchema)

type GetUnifiedSearchParams = {
  businessId: string
  entity: string
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

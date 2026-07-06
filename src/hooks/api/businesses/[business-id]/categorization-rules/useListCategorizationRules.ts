import { type PaginationParams, SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { type CategorizationRule, CategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@hooks/utils/swr/createInfiniteQueryGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

export const LIST_CATEGORIZATION_RULES_TAG_KEY = '#list-categorization-rules'

export type ListCategorizationRulesFilterParams = {
  externalIds?: ReadonlyArray<string>
  includeArchived?: boolean
}

enum SortBy {
  CreatedAt = 'created_at',
}

type ListCategorizationRulesParams = {
  businessId: string
  cursor?: string
} & ListCategorizationRulesFilterParams & Omit<PaginationParams, 'cursor'> & SortParams<SortBy>

const ListCategorizationRulesReturnSchema = PaginatedResponseSchema(CategorizationRuleSchema)

export const listCategorizationRules = getWithQuery<
  typeof ListCategorizationRulesReturnSchema.Encoded,
  ListCategorizationRulesParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/categorization-rules`,
)

export const useListCategorizationRules = createInfiniteQueryHook({
  tags: [LIST_CATEGORIZATION_RULES_TAG_KEY],
  request: listCategorizationRules,
  schema: ListCategorizationRulesReturnSchema,
  keyDefaults: {
    sortBy: SortBy.CreatedAt,
    sortOrder: SortOrder.DESC,
    showTotalCount: true,
  },
})

export const useCategorizationRulesGlobalCacheActions = createInfiniteQueryGlobalCacheActions<CategorizationRule>(LIST_CATEGORIZATION_RULES_TAG_KEY)

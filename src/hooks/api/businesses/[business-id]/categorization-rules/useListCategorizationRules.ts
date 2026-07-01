import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { type PaginationParams, SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { type CategorizationRule, CategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const LIST_CATEGORIZATION_RULES_TAG_KEY = '#list-categorization-rules'

type ListCategorizationRulesBaseParams = {
  businessId: string
}

export type ListCategorizationRulesFilterParams = {
  externalIds?: ReadonlyArray<string>
  includeArchived?: boolean
}

enum SortBy {
  CreatedAt = 'created_at',
}

type ListCategorizationRulesOptions = ListCategorizationRulesFilterParams & PaginationParams & SortParams<SortBy>

type ListCategorizationRulesParams = ListCategorizationRulesBaseParams & ListCategorizationRulesOptions

const ListCategorizationRulesReturnSchema = PaginatedResponseSchema(CategorizationRuleSchema)

type ListCategorizationRulesReturn = typeof ListCategorizationRulesReturnSchema.Type

export const listCategorizationRules = get<
  ListCategorizationRulesReturn,
  ListCategorizationRulesParams
>(({ businessId, externalIds, includeArchived, sortBy, sortOrder, cursor, limit, showTotalCount }) => {
  const parameters = toDefinedSearchParameters({
    externalIds,
    includeArchived,
    sortBy,
    sortOrder,
    cursor,
    limit,
    showTotalCount,
  })

  const baseUrl = `/v1/businesses/${businessId}/categorization-rules`
  return parameters ? `${baseUrl}?${parameters}` : baseUrl
})

const keyLoader = createInfiniteKeyLoader<Omit<ListCategorizationRulesParams, 'cursor'>, ListCategorizationRulesReturn>([LIST_CATEGORIZATION_RULES_TAG_KEY])

export function useListCategorizationRules({
  externalIds,
  includeArchived,
  sortBy = SortBy.CreatedAt,
  sortOrder = SortOrder.DESC,
  limit,
  showTotalCount = true,
}: ListCategorizationRulesOptions = {}) {
  const { withLocale, businessId, apiUrl, auth } = useBuildKeyInputs()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListCategorizationRulesReturn | null) => withLocale(keyLoader(
      previousPageData,
      {
        ...auth,
        apiUrl,
        businessId,
        externalIds,
        includeArchived,
        sortBy,
        sortOrder,
        limit,
        showTotalCount,
      },
    )),
    ({
      accessToken,
      apiUrl,
      businessId,
      cursor,
      externalIds,
      includeArchived,
      sortBy,
      sortOrder,
      limit,
      showTotalCount,
    }) => listCategorizationRules(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          externalIds,
          includeArchived,
          sortBy,
          sortOrder,
          cursor,
          limit,
          showTotalCount,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListCategorizationRulesReturnSchema)),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  usePreserveInfiniteSize(swrResponse)

  return useSWRInfiniteResult(swrResponse)
}

export const useCategorizationRulesGlobalCacheActions = createInfiniteQueryGlobalCacheActions<CategorizationRule>(LIST_CATEGORIZATION_RULES_TAG_KEY)

import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRInfinite, { type SWRInfiniteResponse } from 'swr/infinite'

import { PaginatedResponseMetaSchema, type PaginationParams, SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { type CategorizationRule, CategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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

const ListCategorizationRulesReturnSchema = Schema.Struct({
  data: Schema.Array(CategorizationRuleSchema),
  meta: Schema.Struct({
    pagination: PaginatedResponseMetaSchema,
  }),
})

type ListCategorizationRulesReturn = typeof ListCategorizationRulesReturnSchema.Type

class ListCategorizationRulesSWRResponse {
  private swrResponse: SWRInfiniteResponse<ListCategorizationRulesReturn>

  constructor(swrResponse: SWRInfiniteResponse<ListCategorizationRulesReturn>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get paginationMeta() {
    if (!this.data || this.data.length === 0) return undefined
    const lastPage = this.data[this.data.length - 1]
    return lastPage?.meta.pagination
  }

  get hasMore() {
    return this.paginationMeta?.hasMore
  }

  get size() {
    return this.swrResponse.size
  }

  get setSize() {
    return this.swrResponse.setSize
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }

  get refetch() {
    return this.swrResponse.mutate
  }
}

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

function keyLoader(
  previousPageData: ListCategorizationRulesReturn | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    externalIds,
    includeArchived,
    sortBy,
    sortOrder,
    limit,
    showTotalCount,
  }: {
    access_token?: string
    apiUrl?: string
  } & Omit<ListCategorizationRulesParams, 'cursor'>,
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      externalIds,
      includeArchived,
      cursor: previousPageData?.meta?.pagination.cursor,
      sortBy,
      sortOrder,
      limit,
      showTotalCount,
      tags: [LIST_CATEGORIZATION_RULES_TAG_KEY],
    } as const
  }
}

export function useListCategorizationRules({
  externalIds,
  includeArchived,
  sortBy = SortBy.CreatedAt,
  sortOrder = SortOrder.DESC,
  limit,
  showTotalCount = true,
}: ListCategorizationRulesOptions = {}) {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListCategorizationRulesReturn | null) => keyLoader(
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
    ),
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

  return new ListCategorizationRulesSWRResponse(swrResponse)
}

const withUpdatedCategorizationRule = (updated: CategorizationRule) =>
  (rule: CategorizationRule): CategorizationRule => rule.id === updated.id ? updated : rule

export function useCategorizationRulesGlobalCacheActions() {
  const { patchCache, forceReload } = useGlobalCacheActions()

  const patchCategorizationRuleByKey = useCallback((updatedCategorizationRule: CategorizationRule) =>
    patchCache<ListCategorizationRulesReturn[] | ListCategorizationRulesReturn | undefined>(
      ({ tags }) => tags.includes(LIST_CATEGORIZATION_RULES_TAG_KEY),
      (currentData) => {
        const iterateOverPage = (page: ListCategorizationRulesReturn): ListCategorizationRulesReturn => ({
          ...page,
          data: page.data.map(withUpdatedCategorizationRule(updatedCategorizationRule)),
        })

        return Array.isArray(currentData)
          ? currentData.map(iterateOverPage)
          : currentData
      },
    ),
  [patchCache],
  )

  const forceReloadCategorizationRules = useCallback(
    () => forceReload(({ tags }) => tags.includes(LIST_CATEGORIZATION_RULES_TAG_KEY)),
    [forceReload],
  )

  return { patchCategorizationRuleByKey, forceReloadCategorizationRules }
}

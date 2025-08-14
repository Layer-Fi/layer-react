import { useCallback, useMemo } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../../hooks/useAuth'
import { get } from '../../api/layer/authenticated_http'
import useSWR, { type SWRResponse } from 'swr'
import { Schema } from 'effect'
import { useGlobalCacheActions } from '../../utils/swr/useGlobalCacheActions'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { ProfitAndLoss, type ProfitAndLossQueryRequestParams, ProfitAndLossQuerySchema } from './schemas'
import { debounce } from 'lodash'

export const PNL_QUERY_TAG_KEY = '#profit-and-loss-query'

class ProfitAndLossQuerySWRResponse {
  private swrResponse: SWRResponse<ProfitAndLoss>

  constructor(swrResponse: SWRResponse<ProfitAndLoss>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
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

  get mutate() {
    return this.swrResponse.mutate
  }
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  startDate,
  endDate,
  tagKey,
  tagValues,
  reportingBasis,
  includeUncategorized,
}: {
  access_token?: string
  apiUrl?: string
} & ProfitAndLossQueryRequestParams) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      startDate,
      endDate,
      tagKey,
      tagValues,
      reportingBasis,
      includeUncategorized,
      tags: [PNL_QUERY_TAG_KEY],
    } as const
  }
}

const getProfitAndLoss = get<
  { data: ProfitAndLoss },
  ProfitAndLossQueryRequestParams
>(
  ({
    businessId,
    startDate,
    endDate,
    tagKey,
    tagValues,
    reportingBasis,
    includeUncategorized,
  }) => {
    const parameters = toDefinedSearchParameters({ startDate, endDate, tagKey, tagValues, reportingBasis, includeUncategorized })
    return `/v1/businesses/${businessId}/reports/profit-and-loss?${parameters}`
  })

type useProfitAndLossQueryProps = Omit<ProfitAndLossQueryRequestParams, 'businessId'>
export function useProfitAndLossQuery({ startDate, endDate, tagKey, tagValues, reportingBasis, includeUncategorized }: useProfitAndLossQueryProps) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => buildKey({
      ...data,
      businessId,
      startDate,
      endDate,
      tagKey,
      tagValues,
      reportingBasis,
      includeUncategorized,
    }),
    ({ accessToken, apiUrl, businessId }) => getProfitAndLoss(
      apiUrl,
      accessToken,
      {
        params: { businessId, startDate, endDate, tagKey, tagValues, reportingBasis, includeUncategorized },
      },
    )().then(({ data }) => Schema.decodeUnknownPromise(ProfitAndLossQuerySchema)(data)),
  )

  return new ProfitAndLossQuerySWRResponse(response)
}

const INVALIDATE_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export const useProfitAndLossQueryCacheActions = () => {
  const { invalidate } = useGlobalCacheActions()

  const invalidateProfitAndLossQuery = useCallback(
    () => invalidate(
      tags => tags.includes(PNL_QUERY_TAG_KEY),
    ),
    [invalidate],
  )

  const debouncedInvalidateProfitAndLossQuery = useMemo(
    () => debounce(
      invalidateProfitAndLossQuery,
      INVALIDATE_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATE_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidateProfitAndLossQuery],
  )

  return { invalidateProfitAndLossQuery, debouncedInvalidateProfitAndLossQuery }
}

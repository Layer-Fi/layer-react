import { useCallback, useMemo } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../../hooks/useAuth'
import { get } from '../../api/layer/authenticated_http'
import useSWR, { type SWRResponse } from 'swr'
import { Schema } from 'effect'
import { useGlobalCacheActions } from '../../utils/swr/useGlobalCacheActions'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { type ProfitAndLossSummaries, ProfitAndLossSummariesSchema, ProfitAndLossSummariesRequestParams } from './schemas'
import { debounce } from 'lodash-es'

export const PNL_SUMMARIES_TAG_KEY = '#profit-and-loss-summaries'

class ProfitAndLossSummariesSWRResponse {
  private swrResponse: SWRResponse<ProfitAndLossSummaries>

  constructor(swrResponse: SWRResponse<ProfitAndLossSummaries>) {
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
  startMonth,
  startYear,
  endMonth,
  endYear,
  tagKey,
  tagValues,
  reportingBasis,
}: {
  access_token?: string
  apiUrl?: string
} & ProfitAndLossSummariesRequestParams) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      startMonth,
      startYear,
      endMonth,
      endYear,
      tagKey,
      tagValues,
      reportingBasis,
      tags: [PNL_SUMMARIES_TAG_KEY],
    } as const
  }
}

const getProfitAndLossSummaries = get<
  { data: ProfitAndLossSummaries },
  ProfitAndLossSummariesRequestParams
>(
  ({
    businessId,
    startYear,
    startMonth,
    endYear,
    endMonth,
    tagKey,
    tagValues,
    reportingBasis,
  }) => {
    const parameters = toDefinedSearchParameters({ startYear, startMonth, endYear, endMonth, tagKey, tagValues, reportingBasis })
    return `/v1/businesses/${businessId}/reports/profit-and-loss-summaries?${parameters}`
  })

type UseProfitAndLossSummariesProps = Omit<ProfitAndLossSummariesRequestParams, 'businessId'>
export function useProfitAndLossSummaries({ startYear, startMonth, endYear, endMonth, tagKey, tagValues, reportingBasis }: UseProfitAndLossSummariesProps) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => buildKey({
      ...data,
      businessId,
      startYear,
      startMonth,
      endYear,
      endMonth,
      tagKey,
      tagValues,
      reportingBasis,
    }),
    ({ accessToken, apiUrl, businessId }) => getProfitAndLossSummaries(
      apiUrl,
      accessToken,
      {
        params: { businessId, startYear, startMonth, endYear, endMonth, tagKey, tagValues, reportingBasis },
      },
    )().then(({ data }) => Schema.decodeUnknownPromise(ProfitAndLossSummariesSchema)(data)),
  )

  return new ProfitAndLossSummariesSWRResponse(response)
}

const INVALIDATE_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export const useProfitAndLossSummariesCacheActions = () => {
  const { invalidate } = useGlobalCacheActions()

  const invalidateProfitAndLossSummaries = useCallback(
    () => invalidate(
      tags => tags.includes(PNL_SUMMARIES_TAG_KEY),
    ),
    [invalidate],
  )

  const debouncedInvalidateProfitAndLossSummaries = useMemo(
    () => debounce(
      invalidateProfitAndLossSummaries,
      INVALIDATE_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATE_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidateProfitAndLossSummaries],
  )

  return { invalidateProfitAndLossSummaries, debouncedInvalidateProfitAndLossSummaries }
}

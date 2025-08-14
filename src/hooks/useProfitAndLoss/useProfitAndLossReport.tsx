import { useCallback, useMemo } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { get } from '../../api/layer/authenticated_http'
import useSWR, { type SWRResponse } from 'swr'
import { Schema } from 'effect'
import { useGlobalCacheActions } from '../../utils/swr/useGlobalCacheActions'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { ProfitAndLoss, type ProfitAndLossReportRequestParams, ProfitAndLossReportSchema } from './schemas'
import { debounce } from 'lodash'

export const PNL_REPORT_TAG_KEY = '#profit-and-loss-report'

class ProfitAndLossReportSWRResponse {
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
} & ProfitAndLossReportRequestParams) {
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
      tags: [PNL_REPORT_TAG_KEY],
    } as const
  }
}

const getProfitAndLoss = get<
  { data: ProfitAndLoss },
  ProfitAndLossReportRequestParams
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

type UseProfitAndLossReportProps = Omit<ProfitAndLossReportRequestParams, 'businessId'>
export function useProfitAndLossReport({ startDate, endDate, tagKey, tagValues, reportingBasis, includeUncategorized }: UseProfitAndLossReportProps) {
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
    )().then(({ data }) => Schema.decodeUnknownPromise(ProfitAndLossReportSchema)(data)),
  )

  return new ProfitAndLossReportSWRResponse(response)
}

const INVALIDATE_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export const useProfitAndLossReportCacheActions = () => {
  const { invalidate } = useGlobalCacheActions()

  const invalidateProfitAndLossReport = useCallback(
    () => invalidate(
      tags => tags.includes(PNL_REPORT_TAG_KEY),
    ),
    [invalidate],
  )

  const debouncedInvalidateProfitAndLossReport = useMemo(
    () => debounce(
      invalidateProfitAndLossReport,
      INVALIDATE_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATE_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidateProfitAndLossReport],
  )

  return { invalidateProfitAndLossReport, debouncedInvalidateProfitAndLossReport }
}

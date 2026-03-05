import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { get } from '@utils/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/useAuth'
import { type ProfitAndLoss, type ProfitAndLossReportRequestParams, ProfitAndLossReportSchema } from '@hooks/useProfitAndLoss/schemas'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const PNL_REPORT_TAG_KEY = '#profit-and-loss-report'

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

  return new SWRQueryResult(response)
}

export const useProfitAndLossReportCacheActions = () => {
  const { invalidate } = useGlobalCacheActions()

  const invalidateProfitAndLossReport = useCallback(
    () => invalidate(
      ({ tags }) => tags.includes(PNL_REPORT_TAG_KEY),
    ),
    [invalidate],
  )

  return { invalidateProfitAndLossReport }
}

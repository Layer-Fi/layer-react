import { useCallback } from 'react'
import useSWR, { type SWRResponse } from 'swr'

import { type ReportingBasis } from '@internal-types/general'
import { type ProfitAndLossComparison, type ProfitAndLossComparisonRequestBody } from '@internal-types/profit_and_loss'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { post } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const PNL_COMPARISON_REPORT_TAG_KEY = '#profit-and-loss-comparison-report'

type ProfitAndLossComparisonKey = {
  accessToken: string
  apiUrl: string
  businessId: string
  periods: ProfitAndLossComparisonRequestBody['periods']
  tagFilters?: ProfitAndLossComparisonRequestBody['tag_filters']
  reportingBasis?: ReportingBasis
  tags: [typeof PNL_COMPARISON_REPORT_TAG_KEY]
}

type ProfitAndLossComparisonRequestParams = {
  businessId: string
  periods?: ProfitAndLossComparisonRequestBody['periods']
  tagFilters?: ProfitAndLossComparisonRequestBody['tag_filters']
  reportingBasis?: ReportingBasis
}

function buildKey({
  accessToken,
  apiUrl,
  businessId,
  periods,
  tagFilters,
  reportingBasis,
}: {
  accessToken?: string
  apiUrl?: string
} & ProfitAndLossComparisonRequestParams): ProfitAndLossComparisonKey | null {
  if (accessToken && apiUrl && periods) {
    return {
      accessToken,
      apiUrl,
      businessId,
      periods,
      tagFilters,
      reportingBasis,
      tags: [PNL_COMPARISON_REPORT_TAG_KEY],
    }
  }

  return null
}

const compareProfitAndLoss = post<
  { data?: ProfitAndLossComparison },
  ProfitAndLossComparisonRequestBody
>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss-comparison`,
)

type UseProfitAndLossComparisonReportProps = Omit<ProfitAndLossComparisonRequestParams, 'businessId'>

export function useProfitAndLossComparisonReport({
  periods,
  tagFilters,
  reportingBasis,
}: UseProfitAndLossComparisonReportProps): SWRResponse<ProfitAndLossComparison | undefined, unknown> {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const authData = data as { access_token?: string } | undefined
  const key = buildKey({
    accessToken: authData?.access_token,
    apiUrl,
    businessId,
    periods,
    tagFilters,
    reportingBasis,
  })

  const response = useSWR<ProfitAndLossComparison | undefined, unknown, ProfitAndLossComparisonKey | null>(
    key,
    key => compareProfitAndLoss(
      key.apiUrl,
      key.accessToken,
      {
        params: { businessId: key.businessId },
        body: {
          periods: key.periods,
          tag_filters: key.tagFilters,
          reporting_basis: key.reportingBasis,
        },
      },
    ).then(({ data }) => data),
  )

  return response
}

export const useProfitAndLossComparisonReportCacheActions = () => {
  const { invalidate } = useGlobalCacheActions()

  const invalidateProfitAndLossComparisonReport = useCallback(
    () => invalidate(
      ({ tags }) => tags.includes(PNL_COMPARISON_REPORT_TAG_KEY),
    ),
    [invalidate],
  )

  return { invalidateProfitAndLossComparisonReport }
}

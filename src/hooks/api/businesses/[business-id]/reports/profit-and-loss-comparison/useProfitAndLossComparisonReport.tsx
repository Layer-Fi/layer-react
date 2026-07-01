import { useCallback } from 'react'
import useSWR from 'swr'

import { type ReportingBasis } from '@internal-types/general'
import { type ProfitAndLossComparison, type ProfitAndLossComparisonRequestBody } from '@internal-types/profitAndLoss'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const PNL_COMPARISON_REPORT_TAG_KEY = '#profit-and-loss-comparison-report'

type ProfitAndLossComparisonRequestParams = {
  businessId: string
  periods?: ProfitAndLossComparisonRequestBody['periods']
  tagFilters?: ProfitAndLossComparisonRequestBody['tag_filters']
  reportingBasis?: ReportingBasis
}

const buildKey = createBuildKey<ProfitAndLossComparisonRequestParams>([PNL_COMPARISON_REPORT_TAG_KEY])

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
}: UseProfitAndLossComparisonReportProps) {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()

  const response = useSWR(
    () => withLocale(buildKey({
      ...data,
      apiUrl,
      businessId,
      periods,
      tagFilters,
      reportingBasis,
      isEnabled: Boolean(periods),
    })),
    ({ accessToken, apiUrl, businessId }) => compareProfitAndLoss(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body: {
          periods: periods!,
          tag_filters: tagFilters,
          reporting_basis: reportingBasis,
        },
      },
    ).then(({ data }) => data),
  )

  return new SWRQueryResult(response)
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

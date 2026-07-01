import useSWR from 'swr'

import { type ReportingBasis } from '@internal-types/general'
import { type ProfitAndLossComparison, type ProfitAndLossComparisonRequestBody } from '@internal-types/profitAndLoss'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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
  const { withLocale, businessId, apiUrl, auth } = useBuildKeyInputs()

  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
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

export const useProfitAndLossComparisonReportCacheActions = createResourceGlobalCacheActions<ProfitAndLossComparison>(PNL_COMPARISON_REPORT_TAG_KEY)

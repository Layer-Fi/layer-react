import { type ReportingBasis } from '@internal-types/general'
import { type ProfitAndLossComparison, type ProfitAndLossComparisonRequestBody } from '@internal-types/profitAndLoss'
import { post } from '@utils/api/authenticatedHttp'
import { type MutationRequest, postAsQuery } from '@utils/api/getAsMutation'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const PNL_COMPARISON_REPORT_TAG_KEY = '#profit-and-loss-comparison-report'

type ProfitAndLossComparisonRequestParams = {
  businessId: string
  periods?: ProfitAndLossComparisonRequestBody['periods']
  tagFilters?: ProfitAndLossComparisonRequestBody['tag_filters']
  reportingBasis?: ReportingBasis
}

type ProfitAndLossComparisonResponse = {
  data: ProfitAndLossComparison
}

const compareProfitAndLoss = post<
  ProfitAndLossComparisonResponse,
  ProfitAndLossComparisonRequestBody
>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss-comparison`,
)

const requestProfitAndLossComparison: MutationRequest<
  ProfitAndLossComparisonResponse,
  ProfitAndLossComparisonRequestBody,
  ProfitAndLossComparisonRequestParams
> = (baseUrl, accessToken, options) => compareProfitAndLoss(
  baseUrl,
  accessToken,
  {
    params: options?.params && { businessId: options.params.businessId },
    body: options?.body,
  },
)

export const useProfitAndLossComparisonReport = createQueryHook({
  tags: [PNL_COMPARISON_REPORT_TAG_KEY],
  request: postAsQuery(
    requestProfitAndLossComparison,
    ({ periods, tagFilters, reportingBasis }) => ({
      periods: periods!,
      tag_filters: tagFilters,
      reporting_basis: reportingBasis,
    }),
  ),
  select: ({ data }: ProfitAndLossComparisonResponse) => data,
})

export const useProfitAndLossComparisonReportCacheActions = createResourceGlobalCacheActions<ProfitAndLossComparison>(PNL_COMPARISON_REPORT_TAG_KEY)

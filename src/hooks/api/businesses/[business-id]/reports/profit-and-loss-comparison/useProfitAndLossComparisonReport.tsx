import { Schema } from 'effect'

import { type ReportingBasis } from '@internal-types/general'
import { type ProfitAndLossComparison, type ProfitAndLossComparisonRequestBody } from '@internal-types/profitAndLoss'
import { post } from '@utils/api/authenticatedHttp'
import { type MutationRequest, postAsQuery } from '@utils/api/postAsQuery'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const PNL_COMPARISON_REPORT_TAG_KEY = '#profit-and-loss-comparison-report'

type ProfitAndLossComparisonRequestParams = {
  businessId: string
  periods?: ProfitAndLossComparisonRequestBody['periods']
  tagFilters?: ProfitAndLossComparisonRequestBody['tag_filters']
  reportingBasis?: ReportingBasis
}

const ProfitAndLossComparisonFromSelf = Schema.declare(
  (input: unknown): input is ProfitAndLossComparison => typeof input === 'object' && input !== null,
)

const ProfitAndLossComparisonResponseSchema = Schema.Struct({
  data: Schema.optional(ProfitAndLossComparisonFromSelf),
})

const compareProfitAndLoss = post<
  typeof ProfitAndLossComparisonResponseSchema.Encoded,
  ProfitAndLossComparisonRequestBody
>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss-comparison`,
)

const requestProfitAndLossComparison: MutationRequest<
  typeof ProfitAndLossComparisonResponseSchema.Encoded,
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

const useProfitAndLossComparisonReportQuery = createQueryHook({
  tags: [PNL_COMPARISON_REPORT_TAG_KEY],
  request: postAsQuery(
    requestProfitAndLossComparison,
    ({ periods, tagFilters, reportingBasis }) => ({
      periods: periods!,
      tag_filters: tagFilters,
      reporting_basis: reportingBasis,
    }),
  ),
  schema: ProfitAndLossComparisonResponseSchema,
  select: ({ data }) => data,
})

type UseProfitAndLossComparisonReportProps = Omit<ProfitAndLossComparisonRequestParams, 'businessId'>

export function useProfitAndLossComparisonReport({
  periods,
  tagFilters,
  reportingBasis,
}: UseProfitAndLossComparisonReportProps) {
  return useProfitAndLossComparisonReportQuery({
    periods,
    tagFilters,
    reportingBasis,
    isEnabled: Boolean(periods),
  })
}

export const useProfitAndLossComparisonReportCacheActions = createResourceGlobalCacheActions<ProfitAndLossComparison>(PNL_COMPARISON_REPORT_TAG_KEY)

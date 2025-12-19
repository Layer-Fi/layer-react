import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash-es'
import useSWR from 'swr'

import { type ReportingBasis } from '@internal-types/general'
import { type ProfitAndLossComparison, type ProfitAndLossComparisonRequestBody } from '@internal-types/profit_and_loss'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { post } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const PNL_COMPARISON_REPORT_TAG_KEY = '#profit-and-loss-comparison-report'

type ProfitAndLossComparisonRequestParams = {
  businessId: string
  periods?: ProfitAndLossComparisonRequestBody['periods']
  tagFilters?: ProfitAndLossComparisonRequestBody['tag_filters']
  reportingBasis?: ReportingBasis
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  periods,
  tagFilters,
  reportingBasis,
}: {
  access_token?: string
  apiUrl?: string
} & ProfitAndLossComparisonRequestParams) {
  if (accessToken && apiUrl && periods) {
    return {
      accessToken,
      apiUrl,
      businessId,
      periods,
      tagFilters,
      reportingBasis,
      tags: [PNL_COMPARISON_REPORT_TAG_KEY],
    } as const
  }
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
}: UseProfitAndLossComparisonReportProps) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()

  const response = useSWR(
    () => buildKey({
      ...data,
      apiUrl,
      businessId,
      periods,
      tagFilters,
      reportingBasis,
    }),
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

  return response
}

const INVALIDATE_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export const useProfitAndLossComparisonReportCacheActions = () => {
  const { invalidate } = useGlobalCacheActions()

  const invalidateProfitAndLossComparisonReport = useCallback(
    () => invalidate(
      ({ tags }) => tags.includes(PNL_COMPARISON_REPORT_TAG_KEY),
    ),
    [invalidate],
  )

  const debouncedInvalidateProfitAndLossComparisonReport = useMemo(
    () => debounce(
      invalidateProfitAndLossComparisonReport,
      INVALIDATE_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATE_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidateProfitAndLossComparisonReport],
  )

  return { invalidateProfitAndLossComparisonReport, debouncedInvalidateProfitAndLossComparisonReport }
}

import { Schema } from 'effect'
import useSWR from 'swr'

import { type ProfitAndLoss, type ProfitAndLossReportRequestParams, ProfitAndLossReportSchema } from '@schemas/reports/profitAndLoss'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const PNL_REPORT_TAG_KEY = '#profit-and-loss-report'

const buildKey = createBuildKey<ProfitAndLossReportRequestParams>([PNL_REPORT_TAG_KEY])

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
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      startDate,
      endDate,
      tagKey,
      tagValues,
      reportingBasis,
      includeUncategorized,
    })),
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

export const useProfitAndLossReportCacheActions = createResourceGlobalCacheActions<ProfitAndLoss>(PNL_REPORT_TAG_KEY)

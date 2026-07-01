import { Schema } from 'effect'
import useSWR from 'swr'

import { type ProfitAndLossSummaries, type ProfitAndLossSummariesRequestParams, ProfitAndLossSummariesSchema } from '@schemas/reports/profitAndLoss'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const PNL_SUMMARIES_TAG_KEY = '#profit-and-loss-summaries'

const buildKey = createBuildKey<ProfitAndLossSummariesRequestParams>([PNL_SUMMARIES_TAG_KEY])

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

type UseProfitAndLossSummariesProps = Omit<ProfitAndLossSummariesRequestParams, 'businessId'> & {
  keepPreviousData?: boolean
}
export function useProfitAndLossSummaries({
  startYear,
  startMonth,
  endYear,
  endMonth,
  tagKey,
  tagValues,
  reportingBasis,
  keepPreviousData,
}: UseProfitAndLossSummariesProps) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      startYear,
      startMonth,
      endYear,
      endMonth,
      tagKey,
      tagValues,
      reportingBasis,
    })),
    ({ accessToken, apiUrl, businessId }) => getProfitAndLossSummaries(
      apiUrl,
      accessToken,
      {
        params: { businessId, startYear, startMonth, endYear, endMonth, tagKey, tagValues, reportingBasis },
      },
    )().then(({ data }) => Schema.decodeUnknownPromise(ProfitAndLossSummariesSchema)(data)),
    { keepPreviousData },
  )

  return new SWRQueryResult(response)
}

export const useProfitAndLossSummariesCacheActions = createResourceGlobalCacheActions<ProfitAndLossSummaries>(PNL_SUMMARIES_TAG_KEY)

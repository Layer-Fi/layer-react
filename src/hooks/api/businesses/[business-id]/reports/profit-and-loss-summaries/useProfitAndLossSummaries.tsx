import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { type ProfitAndLossSummaries, type ProfitAndLossSummariesRequestParams, ProfitAndLossSummariesSchema } from '@schemas/reports/profitAndLoss'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const PNL_SUMMARIES_TAG_KEY = '#profit-and-loss-summaries'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  startMonth,
  startYear,
  endMonth,
  endYear,
  tagKey,
  tagValues,
  reportingBasis,
}: {
  access_token?: string
  apiUrl?: string
} & ProfitAndLossSummariesRequestParams) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      startMonth,
      startYear,
      endMonth,
      endYear,
      tagKey,
      tagValues,
      reportingBasis,
      tags: [PNL_SUMMARIES_TAG_KEY],
    } as const
  }
}

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
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => withLocale(buildKey({
      ...data,
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

export const useProfitAndLossSummariesCacheActions = () => {
  const { invalidate } = useGlobalCacheActions()

  const invalidateProfitAndLossSummaries = useCallback(
    () => invalidate(
      ({ tags }) => tags.includes(PNL_SUMMARIES_TAG_KEY),
    ),
    [invalidate],
  )

  return { invalidateProfitAndLossSummaries }
}

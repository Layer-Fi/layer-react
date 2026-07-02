import { Schema } from 'effect'
import useSWR from 'swr'

import { type ProfitAndLossSummaries, type ProfitAndLossSummariesRequestParams, ProfitAndLossSummariesSchema } from '@schemas/reports/profitAndLoss'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const PNL_SUMMARIES_TAG_KEY = '#profit-and-loss-summaries'

const buildKey = createBuildKey<ProfitAndLossSummariesRequestParams>([PNL_SUMMARIES_TAG_KEY])

const ProfitAndLossSummariesResponseSchema = Schema.Struct({
  data: ProfitAndLossSummariesSchema,
})

const getProfitAndLossSummaries = getWithQuery<
  typeof ProfitAndLossSummariesResponseSchema.Encoded,
  ProfitAndLossSummariesRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/profit-and-loss-summaries`,
)

const fetchProfitAndLossSummaries = createKeyedFetcher(getProfitAndLossSummaries, ProfitAndLossSummariesResponseSchema)

type UseProfitAndLossSummariesProps = Omit<ProfitAndLossSummariesRequestParams, 'businessId'> & {
  keepPreviousData?: boolean
}
export function useProfitAndLossSummaries({
  keepPreviousData,
  ...params
}: UseProfitAndLossSummariesProps) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      ...params,
    })),
    key => fetchProfitAndLossSummaries(key).then(({ data }) => data),
    { keepPreviousData },
  )

  return new SWRQueryResult(response)
}

export const useProfitAndLossSummariesCacheActions = createResourceGlobalCacheActions<ProfitAndLossSummaries>(PNL_SUMMARIES_TAG_KEY)

import { Schema } from 'effect'
import useSWR from 'swr'

import { UnifiedReportSchema } from '@schemas/reports/unifiedReport'
import { getWithQuery } from '@utils/api/getWithQuery'
import { type QueryParams } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'
import { type UnifiedReportControlParams, type UnifiedReportParams, useUnifiedReportParams } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'

const getTag = (report: string) => `#unified-${report}-report`

const getUnifiedReport = getWithQuery<
  { data: unknown },
  { businessId: string, route: string } & UnifiedReportControlParams & QueryParams
>(
  ['businessId', 'route'],
  ({ businessId, route }) => `/v1/businesses/${businessId}/reports/unified/${route}`,
)

const fetchUnifiedReport = createKeyedFetcher(getUnifiedReport)

export function useUnifiedReport() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const params = useUnifiedReportParams()

  const buildKey = createBuildKey<{ businessId: string } & UnifiedReportParams>(
    params ? [getTag(params.route)] : [],
  )

  const swrResponse = useSWR(
    () => params
      ? withLocale(buildKey({ ...auth, businessId, ...params }))
      : null,
    key => fetchUnifiedReport(key).then(({ data }) => Schema.decodeUnknownPromise(UnifiedReportSchema)(data)),
  )

  return new SWRQueryResult(swrResponse)
}

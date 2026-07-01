import { Schema } from 'effect'
import useSWR from 'swr'

import { UnifiedReportSchema } from '@schemas/reports/unifiedReport'
import { get } from '@utils/api/authenticatedHttp'
import { type QueryParams, toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { type UnifiedReportControlParams, type UnifiedReportParams, useUnifiedReportParams } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const getTag = (report: string) => `#unified-${report}-report`

const getUnifiedReport = get<
  { data: unknown },
  { businessId: string, route: string } & UnifiedReportControlParams & QueryParams
>(({ businessId, route, ...restParams }) => {
  const parameters = toDefinedSearchParameters({ ...restParams })

  return `/v1/businesses/${businessId}/reports/unified/${route}?${parameters}`
})

export function useUnifiedReport() {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()
  const params = useUnifiedReportParams()

  const buildKey = createBuildKey<{ businessId: string } & UnifiedReportParams>(
    params ? [getTag(params.route)] : [],
  )

  const swrResponse = useSWR(
    () => params
      ? withLocale(buildKey({ ...auth, apiUrl, businessId, ...params }))
      : null,
    ({ accessToken, apiUrl, businessId, tags, ...restParams }) => getUnifiedReport(apiUrl, accessToken, {
      params: { businessId, ...restParams },
    })().then(({ data }) => Schema.decodeUnknownPromise(UnifiedReportSchema)(data)),
  )

  return new SWRQueryResult(swrResponse)
}

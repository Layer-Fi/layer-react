import { Schema } from 'effect'
import useSWR from 'swr'

import { UnifiedReportSchema } from '@schemas/reports/unifiedReport'
import { get } from '@utils/api/authenticatedHttp'
import { type QueryParams, toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { type UnifiedReportControlParams, type UnifiedReportParams, useUnifiedReportParams } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const getTag = (report: string) => `#unified-${report}-report`

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  params,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  params: UnifiedReportParams | null
}) {
  if (!params || !accessToken || !apiUrl) return

  return {
    accessToken,
    apiUrl,
    businessId,
    ...params,
    tags: [getTag(params.route)],
  } as const
}

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

  const swrResponse = useSWR(
    () => withLocale(buildKey({
      ...auth,
      apiUrl,
      businessId,
      params,
    })),
    ({ accessToken, apiUrl, businessId, tags, ...restParams }) => getUnifiedReport(apiUrl, accessToken, {
      params: { businessId, ...restParams },
    })().then(({ data }) => Schema.decodeUnknownPromise(UnifiedReportSchema)(data)),
  )

  return new SWRQueryResult(swrResponse)
}

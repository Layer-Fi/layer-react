import { Schema } from 'effect'
import useSWR from 'swr'

import type { ReportType } from '@schemas/reports/reportConfig'
import type { DateGroupBy, UnifiedReportDateQueryParams } from '@schemas/reports/unifiedReport'
import { UnifiedReportSchema } from '@schemas/reports/unifiedReport'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import type { UnifiedReportParams } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const UNIFIED_REPORT_TAG_KEY = '#unified-report'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  reportState,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  reportState: UnifiedReportParams | null
}) {
  if (!reportState || !accessToken || !apiUrl) return

  return {
    accessToken,
    apiUrl,
    businessId,
    ...reportState,
    tags: [UNIFIED_REPORT_TAG_KEY],
  } as const
}

const getUnifiedReport = get<
  { data: unknown },
  { businessId: string, report: ReportType, groupBy: DateGroupBy | null } & UnifiedReportDateQueryParams
>(({ businessId, report, groupBy, ...dateParams }) => {
  const parameters = toDefinedSearchParameters({ ...dateParams, groupBy })

  return `/v1/businesses/${businessId}/reports/unified/${report}?${parameters}`
})

export function useUnifiedReport(reportState: UnifiedReportParams | null) {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => withLocale(buildKey({
      ...auth,
      apiUrl,
      businessId,
      reportState,
    })),
    ({ accessToken, apiUrl, businessId, tags, ...params }) => getUnifiedReport(apiUrl, accessToken, {
      params: { businessId, ...params },
    })().then(({ data }) => Schema.decodeUnknownPromise(UnifiedReportSchema)(data)),
  )

  return new SWRQueryResult(swrResponse)
}

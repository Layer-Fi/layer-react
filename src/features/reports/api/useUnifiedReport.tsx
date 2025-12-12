import { Schema } from 'effect'
import useSWR, { type SWRResponse } from 'swr'

import type { ReportEnum, UnifiedReport, UnifiedReportDateQueryParams } from '@schemas/reports/unifiedReport'
import { UnifiedReportSchema } from '@schemas/reports/unifiedReport'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const UNIFIED_REPORT_TAG_KEY = '#unified-report'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  report,
  ...dateParams
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  report: ReportEnum
} & UnifiedReportDateQueryParams,
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      report,
      tags: [UNIFIED_REPORT_TAG_KEY],
      ...dateParams,
    } as const
  }
}

const getUnifiedReport = get<
  { data: unknown },
  { businessId: string, report: ReportEnum } & UnifiedReportDateQueryParams
>(({ businessId, report, ...dateParams }) => {
  const parameters = toDefinedSearchParameters({ ...dateParams })

  return `/v1/businesses/${businessId}/reports/unified/${report}?${parameters}`
})

class UnifiedReportSWRResponse {
  private swrResponse: SWRResponse<UnifiedReport>

  constructor(swrResponse: SWRResponse<UnifiedReport>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }

  get refetch() {
    return this.swrResponse.mutate
  }
}

type UseUnifiedReportParameters = {
  report: ReportEnum
} & UnifiedReportDateQueryParams

export function useUnifiedReport({ report, ...dateParams }: UseUnifiedReportParameters) {
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => buildKey({
      ...auth,
      apiUrl,
      businessId,
      report,
      ...dateParams,
    }),
    ({ accessToken, apiUrl, businessId }) => getUnifiedReport(apiUrl, accessToken, {
      params: { businessId, report, ...dateParams },
    })().then(({ data }) => Schema.decodeUnknownPromise(UnifiedReportSchema)(data)),
  )

  return new UnifiedReportSWRResponse(swrResponse)
}

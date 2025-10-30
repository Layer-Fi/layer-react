import useSWR, { type SWRResponse } from 'swr'
import { useAuth } from '../../../hooks/useAuth'
import { useEnvironment } from '../../../providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '../../../contexts/LayerContext'
import { get } from '../../../api/layer/authenticated_http'
import { Schema } from 'effect'
import { UnifiedReportSchema, type ReportEnum, type UnifiedReport, type UnifiedReportQueryParams } from '../../../schemas/reports/unifiedReport'
import { toDefinedSearchParameters } from '../../../utils/request/toDefinedSearchParameters'

export const UNIFIED_REPORT_TAG_KEY = '#unified-report'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  report,
  ...queryParams
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  report: ReportEnum
} & UnifiedReportQueryParams,
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      report,
      tags: [UNIFIED_REPORT_TAG_KEY],
      ...queryParams,
    } as const
  }
}

const getUnifiedReport = get<
  { data: unknown },
  { businessId: string, report: ReportEnum } & UnifiedReportQueryParams
>(({ businessId, report, ...queryParams }) => {
  const parameters = toDefinedSearchParameters({ ...queryParams })

  return `/v1/businesses/${businessId}/reports/unified/${report}?${parameters}`
})

type LineItemDecoded = UnifiedReport['lineItems'][number]

interface LineItemWithId extends Omit<LineItemDecoded, 'lineItems'> {
  readonly id: string
  readonly lineItems: ReadonlyArray<LineItemWithId>
}

type UnifiedReportWithId = Omit<UnifiedReport, 'lineItems'> & {
  readonly lineItems: ReadonlyArray<LineItemWithId>
}

const addIdToLineItem = (li: LineItemDecoded): LineItemWithId => ({
  ...li,
  id: li.name,
  lineItems: li.lineItems.map(addIdToLineItem),
})

class UnifiedReportSWRResponse {
  private swrResponse: SWRResponse<UnifiedReportWithId>

  constructor(swrResponse: SWRResponse<UnifiedReportWithId>) {
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
} & UnifiedReportQueryParams

export function useUnifiedReport({ report, ...queryParams }: UseUnifiedReportParameters) {
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => buildKey({
      ...auth,
      apiUrl,
      businessId,
      report,
      ...queryParams,
    }),
    ({ accessToken, apiUrl, businessId }) => getUnifiedReport(apiUrl, accessToken, {
      params: { businessId, report, ...queryParams },
    })().then(({ data }) =>
      Schema
        .decodeUnknownPromise(UnifiedReportSchema)(data)
        .then((rep): UnifiedReportWithId => ({
          ...rep,
          lineItems: rep.lineItems.map(addIdToLineItem),
        })),
    ),
  )

  return new UnifiedReportSWRResponse(swrResponse)
}

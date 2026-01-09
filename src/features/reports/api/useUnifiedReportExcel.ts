import { Schema } from 'effect'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import { S3PresignedUrlSchema, type S3PresignedUrlSchemaType } from '@schemas/common/s3PresignedUrl'
import type { DateGroupBy, ReportEnum, UnifiedReportDateQueryParams } from '@schemas/reports/unifiedReport'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import {
  type UnifiedReportState,
  useUnifiedReportState,
} from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

type GetUnifiedReportExcelParams = {
  businessId: string
  report: ReportEnum
  groupBy: DateGroupBy | null
} & UnifiedReportDateQueryParams

const getUnifiedReportExcel = get<
  { data: S3PresignedUrl },
  GetUnifiedReportExcelParams
>(({ businessId, report, groupBy, ...dateParams }) => {
  const parameters = toDefinedSearchParameters({ ...dateParams, groupBy })

  return `/v1/businesses/${businessId}/reports/unified/${report}/exports/excel?${parameters}`
})

const getTag = (report: ReportEnum) => `#unified-${report}-report-excel`

const UnifiedReportExcelReturnSchema = Schema.Struct({
  data: S3PresignedUrlSchema,
})

type UnifiedReportExcelSWRMutationResponse =
  SWRMutationResponse<S3PresignedUrlSchemaType, unknown, Key, never>

class UnifiedReportExcelSWRResponse {
  private swrResponse: UnifiedReportExcelSWRMutationResponse

  constructor(swrResponse: UnifiedReportExcelSWRMutationResponse) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  reportState,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  reportState: UnifiedReportState
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      ...reportState,
      tags: [getTag(reportState.report)],
    }
  }
}

type UseUnifiedReportExcelOptions = {
  dateSelectionMode: DateSelectionMode
  onSuccess?: (url: S3PresignedUrlSchemaType) => Promise<void> | void
}

export function useUnifiedReportExcel({ dateSelectionMode, onSuccess }: UseUnifiedReportExcelOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const reportState = useUnifiedReportState({ dateSelectionMode })

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...auth,
      businessId,
      reportState,
    }),
    ({ accessToken, apiUrl, businessId, tags, ...reportParams }) =>
      getUnifiedReportExcel(apiUrl, accessToken, {
        params: { businessId, ...reportParams },
      })()
        .then(Schema.decodeUnknownPromise(UnifiedReportExcelReturnSchema))
        .then(async ({ data }) => {
          if (onSuccess) await onSuccess(data)
          return data
        }),
    { revalidate: false, throwOnError: false },
  )

  return new UnifiedReportExcelSWRResponse(rawMutationResponse)
}

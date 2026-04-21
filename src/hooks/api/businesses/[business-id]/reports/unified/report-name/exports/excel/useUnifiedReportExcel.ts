import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { S3PresignedUrlSchema, type S3PresignedUrlSchemaType } from '@schemas/common/s3PresignedUrl'
import type { DateGroupBy, UnifiedReportDateQueryParams } from '@schemas/reports/unifiedReport'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import {
  type UnifiedReportParams,
  useUnifiedReportParams,
} from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

type GetUnifiedReportExcelParams = {
  businessId: string
  report: string
  groupBy: DateGroupBy | null
} & UnifiedReportDateQueryParams

const getUnifiedReportExcel = get<
  { data: S3PresignedUrlSchemaType },
  GetUnifiedReportExcelParams
>(({ businessId, report, groupBy, ...dateParams }) => {
  const parameters = toDefinedSearchParameters({ ...dateParams, groupBy })

  return `/v1/businesses/${businessId}/reports/unified/${report}/exports/excel?${parameters}`
})

const getTag = (report: string) => `#unified-${report}-report-excel`

const UnifiedReportExcelReturnSchema = Schema.Struct({
  data: S3PresignedUrlSchema,
})

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
    tags: [getTag(reportState.report)],
  }
}

type UseUnifiedReportExcelOptions = {
  dateSelectionMode: DateSelectionMode
  onSuccess?: (url: S3PresignedUrlSchemaType) => Promise<void> | void
}

export function useUnifiedReportExcel({ dateSelectionMode, onSuccess }: UseUnifiedReportExcelOptions) {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()
  const reportState = useUnifiedReportParams({ dateSelectionMode })

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      apiUrl,
      businessId,
      reportState,
    })),
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

  return new SWRMutationResult(rawMutationResponse)
}

import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { S3PresignedUrlSchema, type S3PresignedUrlSchemaType } from '@schemas/common/s3PresignedUrl'
import { get } from '@utils/api/authenticatedHttp'
import { type QueryParams, toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import {
  type UnifiedReportControlParams,
  type UnifiedReportParams,
  useUnifiedReportParams,
} from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

type GetUnifiedReportExcelParams = {
  businessId: string
  route: string
} & UnifiedReportControlParams & QueryParams

const getUnifiedReportExcel = get<
  { data: S3PresignedUrlSchemaType },
  GetUnifiedReportExcelParams
>(({ businessId, route, ...restParams }) => {
  const parameters = toDefinedSearchParameters({ ...restParams })

  return `/v1/businesses/${businessId}/reports/unified/${route}/exports/excel?${parameters}`
})

const getTag = (report: string) => `#unified-${report}-report-excel`

const UnifiedReportExcelReturnSchema = Schema.Struct({
  data: S3PresignedUrlSchema,
})

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
  }
}

type UseUnifiedReportExcelOptions = {
  onSuccess?: (url: S3PresignedUrlSchemaType) => Promise<void> | void
}

export function useUnifiedReportExcel({ onSuccess }: UseUnifiedReportExcelOptions = {}) {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()
  const params = useUnifiedReportParams()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      apiUrl,
      businessId,
      params,
    })),
    ({ accessToken, apiUrl, businessId, tags, ...restParams }) =>
      getUnifiedReportExcel(apiUrl, accessToken, {
        params: { businessId, ...restParams },
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

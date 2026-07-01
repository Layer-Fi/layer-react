import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { S3PresignedUrlSchema, type S3PresignedUrlSchemaType } from '@schemas/common/s3PresignedUrl'
import { get } from '@utils/api/authenticatedHttp'
import { type QueryParams, toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'
import {
  type UnifiedReportControlParams,
  type UnifiedReportParams,
  useUnifiedReportParams,
} from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'

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

type UseUnifiedReportExcelOptions = {
  onSuccess?: (url: S3PresignedUrlSchemaType) => Promise<void> | void
}

export function useUnifiedReportExcel({ onSuccess }: UseUnifiedReportExcelOptions = {}) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const params = useUnifiedReportParams()

  const buildKey = createBuildKey<{ businessId: string } & UnifiedReportParams>(
    params ? [getTag(params.route)] : [],
  )

  const rawMutationResponse = useSWRMutation(
    () => params
      ? withLocale(buildKey({ ...auth, businessId, ...params }))
      : null,
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

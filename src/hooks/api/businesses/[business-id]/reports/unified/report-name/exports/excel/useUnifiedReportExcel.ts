import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { S3PresignedUrlSchema, type S3PresignedUrlSchemaType } from '@schemas/common/s3PresignedUrl'
import { getWithQuery } from '@utils/api/getWithQuery'
import { type QueryParams } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
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

const UnifiedReportExcelReturnSchema = Schema.Struct({
  data: S3PresignedUrlSchema,
})

const getUnifiedReportExcel = getWithQuery<
  typeof UnifiedReportExcelReturnSchema.Encoded,
  GetUnifiedReportExcelParams
>(
  ['businessId', 'route'],
  ({ businessId, route }) => `/v1/businesses/${businessId}/reports/unified/${route}/exports/excel`,
)

const fetchUnifiedReportExcel = createKeyedFetcher(getUnifiedReportExcel, UnifiedReportExcelReturnSchema)

const getTag = (report: string) => `#unified-${report}-report-excel`

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
    key => fetchUnifiedReportExcel(key)
      .then(async ({ data }) => {
        if (onSuccess) await onSuccess(data)
        return data
      }),
    { revalidate: false, throwOnError: false },
  )

  return new SWRMutationResult(rawMutationResponse)
}

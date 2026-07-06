import { S3PresignedUrlSchema, type S3PresignedUrlSchemaType } from '@schemas/common/s3PresignedUrl'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { getAsMutation } from '@utils/api/getAsMutation'
import { getWithQuery } from '@utils/api/getWithQuery'
import { type QueryParams } from '@utils/request/toDefinedSearchParameters'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import {
  type UnifiedReportControlParams,
  useUnifiedReportParams,
} from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'

type GetUnifiedReportExcelParams = {
  businessId: string
  route: string
} & UnifiedReportControlParams & QueryParams

const UnifiedReportExcelReturnSchema = UnwrappedDataResponseSchema(S3PresignedUrlSchema)

const getUnifiedReportExcel = getWithQuery<
  typeof UnifiedReportExcelReturnSchema.Encoded,
  GetUnifiedReportExcelParams
>(
  ['businessId', 'route'],
  ({ businessId, route }) => `/v1/businesses/${businessId}/reports/unified/${route}/exports/excel`,
)

const requestUnifiedReportExcel = getAsMutation(getUnifiedReportExcel)

const useUnifiedReportExcelMutation = createMutationHook({
  tags: ['#unified-report-excel'],
  request: requestUnifiedReportExcel,
  keyParamNames: ['route'],
  argToBody: (_arg: undefined) => undefined,
  schema: UnifiedReportExcelReturnSchema,
  swrOptions: { throwOnError: false },
})

type UseUnifiedReportExcelOptions = {
  onSuccess?: (url: S3PresignedUrlSchemaType) => Promise<void> | void
}

export function useUnifiedReportExcel({ onSuccess }: UseUnifiedReportExcelOptions = {}) {
  const params = useUnifiedReportParams()

  return useUnifiedReportExcelMutation({
    ...params,
    route: params?.route ?? '',
    swrOptions: {
      onSuccess: (data) => { void onSuccess?.(data) },
    },
  })
}

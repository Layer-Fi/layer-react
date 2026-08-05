import { type S3PresignedUrlSchemaType } from '@schemas/common/s3PresignedUrl'
import { useGetUnifiedReportExcel } from '@api/businesses/[business-id]/reports/unified/[report-name]/exports/excel/get'
import { useGetUnifiedReport } from '@api/businesses/[business-id]/reports/unified/[report-name]/get'
import { useUnifiedReportParams } from '@providers/features/unifiedReports/UnifiedReportStore/UnifiedReportStoreProvider'

/** Binds the unified report query to the report controls held in the store. */
export function useUnifiedReport() {
  const params = useUnifiedReportParams()

  return useGetUnifiedReport({
    ...params,
    route: params?.route ?? '',
    isEnabled: params !== null,
  })
}

type UseUnifiedReportExcelOptions = {
  onSuccess?: (url: S3PresignedUrlSchemaType) => Promise<void> | void
}

export function useUnifiedReportExcel({ onSuccess }: UseUnifiedReportExcelOptions = {}) {
  const params = useUnifiedReportParams()

  return useGetUnifiedReportExcel({
    ...params,
    route: params?.route ?? '',
    swrOptions: {
      onSuccess: (data) => { void onSuccess?.(data) },
    },
  })
}

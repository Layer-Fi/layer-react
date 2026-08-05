import { type S3PresignedUrl } from '@internal-types/shared/s3'

import { unifiedReportToCsvRows } from '@msw/api/businesses/[business-id]/reports/unified/[report-name]/exports/excel/toCsvRows'
import {
  extractReportRoute,
  resolveUnifiedReport,
  type UnifiedReportOverrides,
} from '@msw/api/businesses/[business-id]/reports/unified/resolveReport'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { csvPresignedUrlResponse } from '@msw/utils/csvPresignedUrl'

const EXCEL_SUFFIX = '/exports/excel'

// Serves CSV via data URL in place of the real endpoint's presigned xlsx.
export const get = createMockEndpoint<UnifiedReportOverrides, { data: S3PresignedUrl }>({
  method: 'get',
  path: '*/v1/businesses/:businessId/reports/unified/*/exports/excel',
  resolve: ({ override, request }) => {
    const route = extractReportRoute(request.url, EXCEL_SUFFIX)
    const params = new URL(request.url).searchParams

    return csvPresignedUrlResponse(
      `${route.replaceAll('/', '-')}.csv`,
      unifiedReportToCsvRows(resolveUnifiedReport(route, params, override)),
    )
  },
})

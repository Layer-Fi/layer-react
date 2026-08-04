import { Schema } from 'effect'

import { type S3PresignedUrl } from '@internal-types/general'
import { type UnifiedReport, type UnifiedReportEncoded, UnifiedReportSchema } from '@schemas/reports/unifiedReport'

import {
  emptyReport,
  unifiedReportGenerators,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/registry'
import { unifiedReportToCsvRows } from '@msw/api/businesses/[business-id]/reports/unified/toCsvRows'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { csvPresignedUrlResponse } from '@msw/utils/csvPresignedUrl'

const encodeReport = Schema.encodeSync(UnifiedReportSchema)

export type UnifiedReportOverrides = Partial<Record<string, UnifiedReport>>

const EXCEL_SUFFIX = '/exports/excel'
const ROUTE_PREFIX = '/reports/unified/'

const extractRoute = (url: string): string => {
  const { pathname } = new URL(url)
  return decodeURIComponent(pathname.slice(pathname.indexOf(ROUTE_PREFIX) + ROUTE_PREFIX.length))
}

type UnifiedReportResponseBody = { data: UnifiedReportEncoded } | { data: S3PresignedUrl }

export const get = createMockEndpoint<UnifiedReportOverrides, UnifiedReportResponseBody>({
  method: 'get',
  path: '*/v1/businesses/:businessId/reports/unified/*',
  resolve: ({ override, request }) => {
    const params = new URL(request.url).searchParams
    const route = extractRoute(request.url)
    const isExcelExport = route.endsWith(EXCEL_SUFFIX)
    // The export builds from the same route, params, and override as the report
    // itself, so a download always matches the table it was triggered from.
    const reportRoute = isExcelExport ? route.slice(0, -EXCEL_SUFFIX.length) : route

    const report = override?.[reportRoute]
      ?? (unifiedReportGenerators[reportRoute]?.(params) ?? emptyReport())

    if (isExcelExport) {
      return csvPresignedUrlResponse(
        `${reportRoute.replaceAll('/', '-')}.csv`,
        unifiedReportToCsvRows(report),
      )
    }

    return apiData(encodeReport(report))
  },
})

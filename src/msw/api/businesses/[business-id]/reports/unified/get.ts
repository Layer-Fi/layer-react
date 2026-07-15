import { Schema } from 'effect'

import { type S3PresignedUrl } from '@internal-types/general'
import { type UnifiedReport, type UnifiedReportEncoded, UnifiedReportSchema } from '@schemas/reports/unifiedReport'

import {
  emptyReport,
  unifiedReportGenerators,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/registry'
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

    if (route.endsWith(EXCEL_SUFFIX)) {
      const reportRoute = route.slice(0, -EXCEL_SUFFIX.length)
      return csvPresignedUrlResponse(`${reportRoute.replaceAll('/', '-')}.csv`, [['Report', reportRoute]])
    }

    const report = override?.[route]
      ?? (unifiedReportGenerators[route]?.(params) ?? emptyReport())

    return apiData(encodeReport(report))
  },
})

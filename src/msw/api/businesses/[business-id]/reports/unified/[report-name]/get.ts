import { Schema } from 'effect'

import { type UnifiedReportEncoded, UnifiedReportSchema } from '@schemas/features/unifiedReports/unifiedReport'

import {
  extractReportRoute,
  resolveUnifiedReport,
  type UnifiedReportOverrides,
} from '@msw/api/businesses/[business-id]/reports/unified/resolveReport'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeReport = Schema.encodeSync(UnifiedReportSchema)

export const get = createMockEndpoint<UnifiedReportOverrides, { data: UnifiedReportEncoded }>({
  method: 'get',
  path: '*/v1/businesses/:businessId/reports/unified/*',
  resolve: ({ override, request }) => {
    const route = extractReportRoute(request.url)
    const params = new URL(request.url).searchParams

    return apiData(encodeReport(resolveUnifiedReport(route, params, override)))
  },
})

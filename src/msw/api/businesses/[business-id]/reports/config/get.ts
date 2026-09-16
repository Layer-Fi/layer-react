import { Schema } from 'effect'

import { type ReportGroup, ReportGroupSchema } from '@schemas/features/unifiedReports/reportConfig'

import { defaultReportGroups } from '@fixtures/unifiedReports/reportConfig'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeReportGroups = Schema.encodeSync(Schema.Array(ReportGroupSchema))

const toResponse = (groups: readonly ReportGroup[]) => apiData(encodeReportGroups(groups))

export const get = createMockEndpoint<readonly ReportGroup[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/reports/config',
  resolve: ({ override }) => toResponse(override ?? defaultReportGroups),
})

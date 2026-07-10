import { parseISO } from 'date-fns'
import { Schema } from 'effect'

import { type ProfitAndLoss, ProfitAndLossReportSchema } from '@schemas/reports/profitAndLoss'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeProfitAndLossReport } from '@fixtures/profitAndLoss/mocks'

const encodeReport = Schema.encodeSync(ProfitAndLossReportSchema)

const toResponse = (report: ProfitAndLoss) => apiData(encodeReport(report))

export const get = createMockEndpoint<ProfitAndLoss, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/reports/profit-and-loss',
  resolve: ({ override, request }) => {
    if (override) return toResponse(override)

    const params = new URL(request.url).searchParams

    // parseISO keeps date-only strings in local time, matching how the app builds ranges.
    return toResponse(makeProfitAndLossReport({
      startDate: parseISO(params.get('start_date') ?? ''),
      endDate: parseISO(params.get('end_date') ?? ''),
    }))
  },
})

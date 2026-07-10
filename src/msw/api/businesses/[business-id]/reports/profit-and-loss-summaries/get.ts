import { Schema } from 'effect'

import { ProfitAndLossSummariesSchema, type ProfitAndLossSummary } from '@schemas/reports/profitAndLoss'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeProfitAndLossSummaries } from '@fixtures/profitAndLoss/mocks'

const encodeSummaries = Schema.encodeSync(ProfitAndLossSummariesSchema)

const toResponse = (months: readonly ProfitAndLossSummary[]) =>
  apiData(encodeSummaries({ type: 'Profit_And_Loss_Summaries', months }))

const readRangeParam = (params: URLSearchParams, key: string) => Number(params.get(key))

export const get = createMockEndpoint<readonly ProfitAndLossSummary[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/reports/profit-and-loss-summaries',
  resolve: ({ override, request }) => {
    if (override) return toResponse(override)

    const params = new URL(request.url).searchParams

    return toResponse(makeProfitAndLossSummaries({
      startYear: readRangeParam(params, 'start_year'),
      startMonth: readRangeParam(params, 'start_month'),
      endYear: readRangeParam(params, 'end_year'),
      endMonth: readRangeParam(params, 'end_month'),
    }))
  },
})

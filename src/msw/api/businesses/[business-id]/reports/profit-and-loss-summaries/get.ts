import { Schema } from 'effect'

import { ProfitAndLossSummariesSchema, type ProfitAndLossSummary } from '@schemas/reports/profitAndLoss'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeProfitAndLossSummaries } from '@fixtures/profitAndLoss/mocks'

const encodeSummaries = Schema.encodeSync(ProfitAndLossSummariesSchema)

const toResponse = (months: readonly ProfitAndLossSummary[]) =>
  apiData(encodeSummaries({ type: 'Profit_And_Loss_Summaries', months }))

const readRangeParam = (params: URLSearchParams, key: string) => {
  const value = Number(params.get(key))
  return Number.isInteger(value) && value > 0 ? value : null
}

export const get = createMockEndpoint<readonly ProfitAndLossSummary[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/reports/profit-and-loss-summaries',
  resolve: ({ override, request }) => {
    if (override) return toResponse(override)

    const params = new URL(request.url).searchParams

    const startYear = readRangeParam(params, 'start_year')
    const startMonth = readRangeParam(params, 'start_month')
    const endYear = readRangeParam(params, 'end_year')
    const endMonth = readRangeParam(params, 'end_month')

    if (startYear === null || startMonth === null || endYear === null || endMonth === null) {
      return toResponse([])
    }

    return toResponse(makeProfitAndLossSummaries({ startYear, startMonth, endYear, endMonth }))
  },
})

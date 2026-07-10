import { Schema } from 'effect'

import { BookkeepingPeriodsSchema } from '@schemas/bookkeepingPeriods'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { type BookkeepingPeriodFixture, makeBookkeepingPeriods } from '@fixtures/bookkeeping/mocks'
import { PROFIT_AND_LOSS_FIXTURE_START_YEAR } from '@fixtures/profitAndLoss/constants'

const encodePeriods = Schema.encodeSync(BookkeepingPeriodsSchema)

const toResponse = (periods: readonly BookkeepingPeriodFixture[]) =>
  apiData(encodePeriods({ periods }))

export const get = createMockEndpoint<readonly BookkeepingPeriodFixture[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bookkeeping/periods',
  resolve: ({ override: periods = makeBookkeepingPeriods(PROFIT_AND_LOSS_FIXTURE_START_YEAR) }) =>
    toResponse(periods),
})

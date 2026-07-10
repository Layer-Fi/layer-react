import { createMockStore } from '@msw/utils/createMockStore'
import { makeBookkeepingPeriods } from '@fixtures/bookkeeping/mocks'
import { PROFIT_AND_LOSS_FIXTURE_START_YEAR } from '@fixtures/profitAndLoss/constants'

export const bookkeepingPeriodStore = createMockStore(
  () => makeBookkeepingPeriods(PROFIT_AND_LOSS_FIXTURE_START_YEAR),
)

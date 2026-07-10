import { type Decorator } from '@storybook/react-vite'

import { type DateRange } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'

import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { handlers } from '@msw/handlers'
import { makeBusiness } from '@fixtures/business/mocks'
import { PinnedGlobalDateRange } from '@test-utils/PinnedGlobalDateRange'

/**
 * September 2025: the chart initializes with the selected month at the right
 * edge of its 12-month window, then shifts forward 3 months, which lands the
 * visible window exactly on Jan-Dec 2025, the last fixture year.
 */
export const PROFIT_AND_LOSS_PINNED_RANGE: DateRange = {
  startDate: new Date(2025, 8, 1),
  endDate: new Date(2025, 8, 30),
}

/**
 * Story-level `parameters.msw.handlers` replaces the global list, so this
 * re-includes it after a business whose activation date predates the earliest
 * fixture year (2022), letting the chart browse the full fixture range.
 */
export const profitAndLossStoryHandlers = [
  getBusiness.mock(makeBusiness({ activationAt: new Date('2022-01-01T00:00:00.000Z') })),
  ...handlers,
]

export const withProfitAndLossStoryContext: Decorator = Story => (
  <PinnedGlobalDateRange dateRange={PROFIT_AND_LOSS_PINNED_RANGE}>
    {/* The default container also applies the theme's CSS variables, which the charts read. */}
    <ProfitAndLoss>
      <Story />
    </ProfitAndLoss>
  </PinnedGlobalDateRange>
)

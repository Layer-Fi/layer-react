import { type Decorator } from '@storybook/react-vite'

import { type DateRange } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'

import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { handlers } from '@msw/handlers'
import { makeBusiness } from '@fixtures/business/mocks'
import { PinnedGlobalDateRange } from '@test-utils/PinnedGlobalDateRange'

export const PROFIT_AND_LOSS_PINNED_RANGE: DateRange = {
  startDate: new Date(2025, 8, 1),
  endDate: new Date(2025, 8, 30),
}

export const profitAndLossStoryHandlers = [
  // Local-time construction: a UTC midnight would fall in the prior December in western timezones.
  getBusiness.mock(makeBusiness({ activationAt: new Date(2024, 0, 1) })),
  ...handlers,
]

export const withProfitAndLossStoryContext = (
  { asContainer = true }: { asContainer?: boolean } = {},
): Decorator => {
  const ProfitAndLossStoryContext: Decorator = Story => (
    <PinnedGlobalDateRange dateRange={PROFIT_AND_LOSS_PINNED_RANGE}>
      <div style={{ display: 'grid', paddingBlock: '2rem', paddingInline: '3rem' }}>
        <div style={{ display: 'grid', minInlineSize: '20rem', maxInlineSize: '80rem' }}>
          <ProfitAndLoss asContainer={asContainer}>
            <Story />
          </ProfitAndLoss>
        </div>
      </div>
    </PinnedGlobalDateRange>
  )

  return ProfitAndLossStoryContext
}

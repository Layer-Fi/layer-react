import { type Decorator } from '@storybook/react-vite'

import { type DateRange } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'

import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { handlers } from '@msw/handlers'
import { makeBusiness } from '@fixtures/business/mocks'
import { PinnedGlobalDateRange } from '@test-utils/PinnedGlobalDateRange'

import './withProfitAndLossStoryContext.scss'

export const PROFIT_AND_LOSS_PINNED_RANGE: DateRange = {
  startDate: new Date(2025, 8, 1),
  endDate: new Date(2025, 8, 30),
}

export const profitAndLossStoryHandlers = [
  getBusiness.mock(makeBusiness({ activationAt: new Date('2022-01-01T00:00:00.000Z') })),
  ...handlers,
]

export const withProfitAndLossStoryContext = (
  { asContainer = true }: { asContainer?: boolean } = {},
): Decorator => {
  const ProfitAndLossStoryContext: Decorator = Story => (
    <PinnedGlobalDateRange dateRange={PROFIT_AND_LOSS_PINNED_RANGE}>
      <div className='ProfitAndLossPage'>
        <div className='ProfitAndLossContainer'>
          <ProfitAndLoss asContainer={asContainer}>
            <Story />
          </ProfitAndLoss>
        </div>
      </div>
    </PinnedGlobalDateRange>
  )

  return ProfitAndLossStoryContext
}

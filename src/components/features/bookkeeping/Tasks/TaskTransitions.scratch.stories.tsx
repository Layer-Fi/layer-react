import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { Tasks } from '@features/bookkeeping/Tasks/Tasks'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { handlers } from '@msw/handlers'
import { PinnedGlobalDateRange } from '@testUtils/storybook/decorators/PinnedGlobalDateRange'
import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { Label } from '@testUtils/storybook/layout/Label'

const NOVEMBER = { startDate: new Date(FIXTURE_YEAR, 10, 1), endDate: new Date(FIXTURE_YEAR, 10, 30) }

const STEPS = [
  'Selection: open “Costco purchases” and pick an option. The chip eases into its selected style.',
  'Follow-up: in the same task, pick “Something else”. Its follow-up question expands open, and collapses when you pick another option.',
  'Completion: answer a “Transaction on …” task and press Submit. It fades out in place and fades back in with the completed tasks.',
  'Mobile: turn on the mobile control and tap “Answer tasks”. Selection and follow-ups behave the same inside the takeover.',
]

const meta: Meta<typeof Tasks> = {
  title: 'Scratch/Task transitions',
  component: Tasks,
  args: { mobile: false },
  argTypes: { mobile: { control: 'boolean' } },
  parameters: {
    chromatic: { disableSnapshot: true },
    msw: { handlers: [getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })), ...handlers] },
  },
}

export default meta

type Story = StoryObj<typeof Tasks>

export const Review: Story = {
  render: ({ mobile }) => (
    <Gallery gap={16}>
      {STEPS.map(step => <Label key={step}>{step}</Label>)}
      <PinnedGlobalDateRange dateRange={NOVEMBER}>
        <Tasks mobile={mobile} />
      </PinnedGlobalDateRange>
    </Gallery>
  ),
}

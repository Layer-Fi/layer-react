import { type Meta, type StoryObj } from '@storybook/react-vite'

import { type DateRange } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { handlers } from '@msw/handlers'
import { makeBusiness } from '@fixtures/business/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { PinnedGlobalDateRange } from '@test-utils/PinnedGlobalDateRange'

const PINNED_RANGE: DateRange = {
  startDate: new Date(FIXTURE_YEAR, 8, 1),
  endDate: new Date(FIXTURE_YEAR, 8, 30),
}

type GlobalMonthPickerProps = {
  truncateMonth?: boolean
  showLabel?: boolean
}

const meta: Meta<GlobalMonthPickerProps> = {
  title: 'Date/GlobalMonthPicker',
  component: GlobalMonthPicker,
  parameters: {
    msw: { handlers: [getBusiness.mock(makeBusiness({ activationAt: new Date(2024, 0, 1) })), ...handlers] },
    controls: { include: ['showLabel', 'truncateMonth'] },
  },
  decorators: [
    Story => (
      <PinnedGlobalDateRange dateRange={PINNED_RANGE}>
        <div style={{ padding: '2rem', maxInlineSize: '20rem' }}>
          <Story />
        </div>
      </PinnedGlobalDateRange>
    ),
  ],
  args: {
    showLabel: false,
    truncateMonth: false,
  },
  argTypes: {
    showLabel: {
      control: 'boolean',
      description: 'Render the "Month" label above the picker',
    },
    truncateMonth: {
      control: 'boolean',
      description: 'Use the short month format (e.g. Sep) instead of the full name',
    },
  },
}

export default meta

type Story = StoryObj<GlobalMonthPickerProps>

export const Default: Story = {}

import { type Meta, type StoryObj } from '@storybook/react-vite'

import { type DateRange } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { GlobalDateRangeSelection } from '@components/DateSelection/GlobalDateRangeSelection'

import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { handlers } from '@msw/handlers'
import { makeBusiness } from '@fixtures/business/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { PinnedGlobalDateRange } from '@test-utils/PinnedGlobalDateRange'

const PINNED_RANGE: DateRange = {
  startDate: new Date(FIXTURE_YEAR, 8, 1),
  endDate: new Date(FIXTURE_YEAR, 8, 30),
}

type GlobalDateRangeSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
}

const meta: Meta<GlobalDateRangeSelectionProps> = {
  title: 'Date/GlobalDateRangeSelection',
  component: GlobalDateRangeSelection,
  parameters: {
    msw: { handlers: [getBusiness.mock(makeBusiness({ activationAt: new Date(2024, 0, 1) })), ...handlers] },
    controls: { include: ['showLabels', 'isCompact'] },
  },
  decorators: [
    Story => (
      <PinnedGlobalDateRange dateRange={PINNED_RANGE}>
        <div style={{ padding: '2rem' }}>
          <Story />
        </div>
      </PinnedGlobalDateRange>
    ),
  ],
  args: {
    showLabels: false,
    isCompact: false,
  },
  argTypes: {
    showLabels: {
      control: 'boolean',
      description: 'Render labels above the range combobox and date pickers',
    },
    isCompact: {
      control: 'boolean',
      description: 'Use the compact layout variant',
    },
  },
}

export default meta

type Story = StoryObj<GlobalDateRangeSelectionProps>

export const Default: Story = {}

import { type Meta, type StoryObj } from '@storybook/react-vite'

import { GlobalDateRangeSelection, type GlobalDateRangeSelectionProps } from '@components/DateSelection/GlobalDateRangeSelection'

import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { handlers } from '@msw/handlers'
import { makeBusiness } from '@fixtures/business/mocks'
import { FIXTURE_YEAR_RANGE } from '@fixtures/constants/fixtureYear'
import { PinnedGlobalDateRange } from '@test-utils/PinnedGlobalDateRange'

const meta: Meta<GlobalDateRangeSelectionProps> = {
  title: 'Date/GlobalDateRangeSelection',
  component: GlobalDateRangeSelection,
  parameters: {
    msw: { handlers: [getBusiness.mock(makeBusiness({ activationAt: new Date(2024, 0, 1) })), ...handlers] },
    controls: { include: ['showLabels', 'isCompact'] },
  },
  decorators: [
    Story => (
      <PinnedGlobalDateRange dateRange={FIXTURE_YEAR_RANGE}>
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

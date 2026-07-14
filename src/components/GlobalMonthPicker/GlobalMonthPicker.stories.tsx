import { type Meta, type StoryObj } from '@storybook/react-vite'

import { GlobalMonthPicker, type GlobalMonthPickerProps } from '@components/GlobalMonthPicker/GlobalMonthPicker'

import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { handlers } from '@msw/handlers'
import { makeBusiness } from '@fixtures/business/mocks'
import { FIXTURE_YEAR_RANGE } from '@fixtures/constants/fixtureYear'
import { PinnedGlobalDateRange } from '@test-utils/PinnedGlobalDateRange'

const meta: Meta<GlobalMonthPickerProps> = {
  title: 'Date/GlobalMonthPicker',
  component: GlobalMonthPicker,
  parameters: {
    msw: { handlers: [getBusiness.mock(makeBusiness({ activationAt: new Date(2024, 0, 1) })), ...handlers] },
    controls: { include: ['showLabel', 'truncateMonth'] },
  },
  decorators: [
    Story => (
      <PinnedGlobalDateRange dateRange={FIXTURE_YEAR_RANGE}>
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

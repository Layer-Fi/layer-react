import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BREAKPOINTS } from '@utils/shared/size/screenSizeBreakpoints'
import { GlobalDateRangeSelection, type GlobalDateRangeSelectionProps } from '@blocks/DatePickers/DateSelection/GlobalDateRangeSelection'

import { makeBusiness } from '@fixtures/business/mocks'
import { FIXTURE_YEAR, FIXTURE_YEAR_RANGE } from '@fixtures/constants/fixtureYear'
import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { handlers } from '@msw/handlers'
import { PinnedGlobalDateRange } from '@testUtils/storybook/decorators/PinnedGlobalDateRange'

const meta: Meta<GlobalDateRangeSelectionProps> = {
  title: 'Blocks/DatePickers/GlobalDateRangeSelection',
  tags: ['public-api'],
  component: GlobalDateRangeSelection,
  parameters: {
    msw: { handlers: [getBusiness.mock(makeBusiness({ activationAt: new Date(FIXTURE_YEAR - 1, 0, 1) })), ...handlers] },
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

export const Default: Story = {
  parameters: { chromatic: { viewports: [BREAKPOINTS.TABLET - 1] } },
  tags: ['docs-screenshot'],
}

import { type Meta, type StoryObj } from '@storybook/react-vite'

import { MileageTracking } from '@views/MileageTracking'

import { FIXTURE_YEAR_RANGE } from '@fixtures/constants/fixtureYear'
import { PinnedGlobalDateRange } from '@test-utils/PinnedGlobalDateRange'

const meta: Meta<typeof MileageTracking> = {
  title: 'Views/MileageTracking',
  component: MileageTracking,
  args: {
    showTitle: true,
  },
  argTypes: {
    showTitle: {
      control: 'boolean',
      description: 'Show the view title and header row',
    },
  },
  decorators: [
    Story => (
      <PinnedGlobalDateRange dateRange={FIXTURE_YEAR_RANGE}>
        <Story />
      </PinnedGlobalDateRange>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof MileageTracking>

export const Default: Story = {}

import { type Meta, type StoryObj } from '@storybook/react-vite'

import { MileageTracking } from '@views/MileageTracking/MileageTracking'

import { FIXTURE_YEAR_RANGE } from '@fixtures/constants/fixtureYear'
import { PinnedGlobalDateRange } from '@testUtils/storybook/decorators/PinnedGlobalDateRange'

const meta: Meta<typeof MileageTracking> = {
  title: 'Views/MileageTracking',
  tags: ['public-api'],
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

export const Default: Story = {
  tags: ['docs-screenshot'],
}

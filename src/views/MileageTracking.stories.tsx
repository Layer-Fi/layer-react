import { type Meta, type StoryObj } from '@storybook/react-vite'

import { unstable_MileageTracking } from '@views/MileageTracking'

import { PinnedFixtureYear } from '@test-utils/PinnedFixtureYear'

const FIXTURE_YEAR = 2025

const meta: Meta<typeof unstable_MileageTracking> = {
  title: 'Views/MileageTracking',
  component: unstable_MileageTracking,
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
      <PinnedFixtureYear year={FIXTURE_YEAR}>
        <Story />
      </PinnedFixtureYear>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof unstable_MileageTracking>

export const Default: Story = {}

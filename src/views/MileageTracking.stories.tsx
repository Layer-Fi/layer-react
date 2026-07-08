import { type Meta, type StoryObj } from '@storybook/react-vite'

import { unstable_MileageTracking } from '@views/MileageTracking'

import { PinnedFixtureYear } from '@test-utils/PinnedFixtureYear'

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
      <PinnedFixtureYear>
        <Story />
      </PinnedFixtureYear>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof unstable_MileageTracking>

export const Default: Story = {}

import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Invoices } from '@components/Invoices/Invoices'

import { PinnedFixtureYear } from '@test-utils/PinnedFixtureYear'

const meta: Meta<typeof Invoices> = {
  title: 'Components/Invoices',
  component: Invoices,
  decorators: [
    Story => (
      <PinnedFixtureYear>
        <Story />
      </PinnedFixtureYear>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Invoices>

export const Default: Story = {}

import { type Meta, type StoryObj } from '@storybook/react-vite'

import { SyncingBadge } from '@blocks/SyncingBadge/SyncingBadge'

const meta: Meta<typeof SyncingBadge> = {
  title: 'Blocks/SyncingBadge',
  component: SyncingBadge,
}

export default meta

type Story = StoryObj<typeof SyncingBadge>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 24, padding: 24 }}>
      <SyncingBadge />
    </div>
  ),
}

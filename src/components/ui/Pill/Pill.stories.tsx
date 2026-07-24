import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Pill } from '@ui/Pill/Pill'

const meta: Meta<typeof Pill> = {
  title: 'UI/Pill',
  component: Pill,
  args: {
    children: 'Pill',
  },
  argTypes: {
    status: { control: 'select', options: [undefined, 'error'] },
  },
}

export default meta

type Story = StoryObj<typeof Pill>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 24 }}>
      <Pill>Default</Pill>
      <Pill status='error'>Error</Pill>
    </div>
  ),
}

import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Square } from '@ui/Square/Square'

const meta: Meta<typeof Square> = {
  title: 'UI/Square',
  component: Square,
}

export default meta

type Story = StoryObj<typeof Square>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <Square>1</Square>,
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 24 }}>
      <Square>1</Square>
      <Square inset>2</Square>
    </div>
  ),
}

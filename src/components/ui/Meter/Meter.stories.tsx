import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Meter } from '@ui/Meter/Meter'

const VALUES = [0, 25, 50, 75, 100]

const meta: Meta<typeof Meter> = {
  title: 'UI/Meter',
  component: Meter,
  args: {
    label: 'Usage',
    value: 60,
    minValue: 0,
    maxValue: 100,
  },
}

export default meta

type Story = StoryObj<typeof Meter>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, width: 320 }}>
      {VALUES.map(value => (
        <Meter key={value} label={`Usage ${value}%`} value={value} minValue={0} maxValue={100} />
      ))}
      <Meter label='Meter only' value={40} minValue={0} maxValue={100} meterOnly />
    </div>
  ),
}

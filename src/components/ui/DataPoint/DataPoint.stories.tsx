import { type Meta, type StoryObj } from '@storybook/react-vite'

import { DataPoint } from '@ui/DataPoint/DataPoint'
import { Span } from '@ui/Typography/Text'

const meta: Meta<typeof DataPoint> = {
  title: 'UI/DataPoint',
  component: DataPoint,
}

export default meta

type Story = StoryObj<typeof DataPoint>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: 24 }}>
      <DataPoint label='Balance due'>
        <Span>$1,240.00</Span>
      </DataPoint>
      <DataPoint label='Open balance'>
        <Span>$3,500.00</Span>
      </DataPoint>
      <DataPoint label='Status'>
        <Span weight='bold'>Paid</Span>
      </DataPoint>
    </div>
  ),
}

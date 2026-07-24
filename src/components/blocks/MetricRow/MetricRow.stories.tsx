import { type Meta, type StoryObj } from '@storybook/react-vite'

import { MetricRow } from '@blocks/MetricRow/MetricRow'

const meta: Meta<typeof MetricRow> = {
  title: 'Blocks/MetricRow',
  component: MetricRow,
}

export default meta

type Story = StoryObj<typeof MetricRow>

const label: React.CSSProperties = { fontSize: 12, opacity: 0.6 }

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, maxWidth: 480 }}>
      <span style={label}>standard</span>
      <MetricRow amount={452000} slotProps={{ Meter: { label: 'Revenue', value: 72 } }} />
      <MetricRow amount={128000} slotProps={{ Meter: { label: 'Expenses', value: 34 } }} />

      <span style={label}>bordered</span>
      <MetricRow showBorder amount={452000} slotProps={{ Meter: { label: 'Revenue', value: 72 } }} />
      <MetricRow showBorder amount={128000} slotProps={{ Meter: { label: 'Expenses', value: 34 } }} />
    </div>
  ),
}

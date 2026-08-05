import { type Meta, type StoryObj } from '@storybook/react-vite'

import { MetricRow } from '@blocks/MetricRow/MetricRow'

import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { Label } from '@testUtils/storybook/layout/Label'

const meta: Meta<typeof MetricRow> = {
  title: 'Blocks/MetricRow',
  component: MetricRow,
}

export default meta

type Story = StoryObj<typeof MetricRow>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery inlineSize={480}>
      <Label>standard</Label>
      <MetricRow amount={452000} slotProps={{ Meter: { label: 'Revenue', value: 72 } }} />
      <MetricRow amount={128000} slotProps={{ Meter: { label: 'Expenses', value: 34 } }} />

      <Label>bordered</Label>
      <MetricRow showBorder amount={452000} slotProps={{ Meter: { label: 'Revenue', value: 72 } }} />
      <MetricRow showBorder amount={128000} slotProps={{ Meter: { label: 'Expenses', value: 34 } }} />
    </Gallery>
  ),
}

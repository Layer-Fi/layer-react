import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Swatch } from '@ui/Swatch/Swatch'

const meta: Meta<typeof Swatch> = {
  title: 'UI/Swatch',
  component: Swatch,
  args: {
    color: '#4B8DF8',
  },
}

export default meta

type Story = StoryObj<typeof Swatch>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

const Cell = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 40 }}>
    <div style={{ width: 24, height: 24 }}>{children}</div>
    <span style={{ fontSize: 11, opacity: 0.6 }}>{label}</span>
  </div>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 24 }}>
      <Cell label='solid'><Swatch color='#4B8DF8' /></Cell>
      <Cell label='opacity'><Swatch color='#4B8DF8' opacity={0.4} /></Cell>
      <Cell label='stripes'><Swatch color='#4B8DF8' pattern='stripes' /></Cell>
      <Cell label='green'><Swatch color='#22A06B' /></Cell>
      <Cell label='red'><Swatch color='#E5484D' /></Cell>
    </div>
  ),
}

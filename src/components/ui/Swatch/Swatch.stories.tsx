import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Swatch } from '@ui/Swatch/Swatch'

import { Col, Gallery } from '@test-utils/storybook/gallery'

const meta: Meta<typeof Swatch> = {
  title: 'UI/Swatch',
  component: Swatch,
  args: {
    color: '#4B8DF8',
  },
}

export default meta

type Story = StoryObj<typeof Swatch>

const Cell = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <Col label={label} inlineSize={48} align='center'>
    <div style={{ inlineSize: 24, blockSize: 24 }}>{children}</div>
  </Col>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery direction='row' gap={16}>
      <Cell label='solid'><Swatch color='#4B8DF8' /></Cell>
      <Cell label='opacity'><Swatch color='#4B8DF8' opacity={0.4} /></Cell>
      <Cell label='stripes'><Swatch color='#4B8DF8' pattern='stripes' /></Cell>
      <Cell label='green'><Swatch color='#22A06B' /></Cell>
      <Cell label='red'><Swatch color='#E5484D' /></Cell>
    </Gallery>
  ),
}

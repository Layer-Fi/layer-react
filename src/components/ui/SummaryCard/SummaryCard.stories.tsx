import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Button } from '@ui/Button/Button'
import { SummaryCard } from '@ui/SummaryCard/SummaryCard'
import { Span } from '@ui/Typography/Text'

const meta: Meta<typeof SummaryCard> = {
  title: 'UI/SummaryCard',
  component: SummaryCard,
}

export default meta

type Story = StoryObj<typeof SummaryCard>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  args: {
    slots: { title: 'Revenue', subtitle: 'Last 30 days' },
    children: <Span>Card content</Span>,
  },
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, maxWidth: 480 }}>
      <SummaryCard slots={{ title: 'Title only' }}>
        <Span>Card content</Span>
      </SummaryCard>
      <SummaryCard slots={{ title: 'Revenue', subtitle: 'Last 30 days' }}>
        <Span>Card content</Span>
      </SummaryCard>
      <SummaryCard
        slots={{
          title: 'With action',
          subtitle: 'Last 30 days',
          primaryAction: <Button variant='outlined'>Export</Button>,
        }}
      >
        <Span>Card content</Span>
      </SummaryCard>
    </div>
  ),
}

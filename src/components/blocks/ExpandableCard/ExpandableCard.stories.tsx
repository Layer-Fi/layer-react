import { type Meta, type StoryObj } from '@storybook/react-vite'

import { HStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'
import { ExpandableCard } from '@blocks/ExpandableCard/ExpandableCard'

import { Col, Gallery } from '@testUtils/storybook/layout/gallery'

const noop = () => {}

const Heading = ({ title, value }: { title: string, value?: string }) => (
  <HStack align='center' gap='sm'>
    <Span weight='bold'>{title}</Span>
    {value && <Span variant='subtle' numeric='tabular-nums'>{value}</Span>}
  </HStack>
)

const CELLS: { label: string, isExpanded: boolean, heading: React.ReactNode, children: React.ReactNode }[] = [
  {
    label: 'collapsed',
    isExpanded: false,
    heading: <Heading title='Payout details' />,
    children: <Span>Hidden while the card is collapsed.</Span>,
  },
  {
    label: 'expanded',
    isExpanded: true,
    heading: <Heading title='Payout details' />,
    children: <Span>Visible content shown while the card is expanded.</Span>,
  },
  {
    label: 'heading with a value',
    isExpanded: true,
    heading: <Heading title='Payout details' value='$3,480.12' />,
    children: <Span>The heading slot takes any node, not just a title.</Span>,
  },
  {
    label: 'long content',
    isExpanded: true,
    heading: <Heading title='Reconciliation notes' value='4 items' />,
    children: (
      <P>
        Deposits are matched against the payout total before the ledger entry is written.
        When a deposit cannot be matched it stays in Stripe Clearing until an entity tag
        is supplied, which is why this card can grow well past a single line.
      </P>
    ),
  },
]

const meta: Meta<typeof ExpandableCard> = {
  title: 'Blocks/ExpandableCard',
  component: ExpandableCard,
  args: {
    isExpanded: true,
    onToggleExpanded: noop,
  },
  argTypes: {
    isExpanded: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof ExpandableCard>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery inlineSize={480}>
      {CELLS.map(({ label, isExpanded, heading, children }) => (
        <Col key={label} label={label}>
          <ExpandableCard
            isExpanded={isExpanded}
            onToggleExpanded={noop}
            slots={{ Heading: heading }}
          >
            {children}
          </ExpandableCard>
        </Col>
      ))}
    </Gallery>
  ),
}

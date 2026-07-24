import { type Meta, type StoryObj } from '@storybook/react-vite'

import { MobileList, type MobileListData } from '@ui/MobileList/MobileList'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

type Row = { id: string, label: string, amount: string }

const ITEMS: Row[] = [
  { id: '1', label: 'Office supplies', amount: '$42.00' },
  { id: '2', label: 'Client lunch', amount: '$88.50' },
  { id: '3', label: 'Software subscription', amount: '$120.00' },
]

const GROUPED: MobileListData<Row> = {
  groups: [
    { label: 'July', items: ITEMS.slice(0, 2) },
    { label: 'June', items: ITEMS.slice(2) },
  ],
}

const renderItem = (item: Row) => (
  <HStack fluid pi='sm' pb='sm' justify='space-between' align='center'>
    <Span size='sm'>{item.label}</Span>
    <Span size='sm' weight='bold'>{item.amount}</Span>
  </HStack>
)

const EmptyState = () => <Span size='sm'>No results found</Span>
const ErrorState = () => <Span size='sm'>Something went wrong</Span>

const meta: Meta<typeof MobileList<Row>> = {
  title: 'UI/MobileList',
  component: MobileList,
  args: {
    ariaLabel: 'Transactions',
    data: ITEMS,
    slots: { EmptyState, ErrorState },
    renderItem,
    isLoading: false,
    isError: false,
  },
}

export default meta

type Story = StoryObj<typeof MobileList<Row>>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: args => (
    <div style={{ width: 360 }}>
      <MobileList {...args} />
    </div>
  ),
}

const Section = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 320 }}>
    <Span size='sm' weight='bold'>{label}</Span>
    {children}
  </div>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 24, flexWrap: 'wrap' }}>
      <Section label='Default'>
        <MobileList<Row>
          ariaLabel='Default'
          data={ITEMS}
          slots={{ EmptyState, ErrorState }}
          renderItem={renderItem}
          isLoading={false}
          isError={false}
        />
      </Section>
      <Section label='Compact'>
        <MobileList<Row>
          ariaLabel='Compact'
          data={ITEMS}
          slots={{ EmptyState, ErrorState }}
          renderItem={renderItem}
          variant='compact'
          isLoading={false}
          isError={false}
        />
      </Section>
      <Section label='Grouped'>
        <MobileList<Row>
          ariaLabel='Grouped'
          data={GROUPED}
          slots={{ EmptyState, ErrorState }}
          renderItem={renderItem}
          isLoading={false}
          isError={false}
        />
      </Section>
      <Section label='Empty'>
        <MobileList<Row>
          ariaLabel='Empty'
          data={[]}
          slots={{ EmptyState, ErrorState }}
          renderItem={renderItem}
          isLoading={false}
          isError={false}
        />
      </Section>
      <Section label='Error'>
        <MobileList<Row>
          ariaLabel='Error'
          data={ITEMS}
          slots={{ EmptyState, ErrorState }}
          renderItem={renderItem}
          isLoading={false}
          isError
        />
      </Section>
      <Section label='Loading'>
        <MobileList<Row>
          ariaLabel='Loading'
          data={undefined}
          slots={{ EmptyState, ErrorState }}
          renderItem={renderItem}
          isLoading
          isError={false}
        />
      </Section>
    </div>
  ),
}

import { type Meta, type StoryObj } from '@storybook/react-vite'
import { Car, CircleCheck, Clock, Copy, CornerDownRight, Pencil, Trash2, TriangleAlert } from 'lucide-react'

import { BadgeVariant } from '@ui/Badge/Badge'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { MobileList, type MobileListData, type MobileListProps } from '@blocks/MobileList/MobileList'
import { type MobileListItemActionsMenuConfig } from '@blocks/MobileList/MobileListItemActionsMenu'
import { MobileListItemContent } from '@blocks/MobileList/MobileListItemContent'
import { MobileListItemStatusFooter } from '@blocks/MobileList/MobileListItemStatusFooter'

import { Col, Frame, Gallery } from '@test-utils/storybook/gallery'

type Row = {
  id: string
  merchant: string
  amount: string
  date: string
  account: string
  category: string
  memo: string
  status: {
    variant: BadgeVariant
    text: string
    subText?: string
  }
}

const ROWS: Row[] = [
  {
    id: 'r1',
    merchant: 'Staples',
    amount: '-$42.00',
    date: 'Jul 23',
    account: 'Business Checking ••4821',
    category: 'Office Supplies',
    memo: 'Printer paper and toner',
    status: { variant: BadgeVariant.SUCCESS, text: 'Categorized', subText: 'Office Supplies' },
  },
  {
    id: 'r2',
    merchant: 'Blue Bottle Coffee',
    amount: '-$88.50',
    date: 'Jul 22',
    account: 'Business Checking ••4821',
    category: 'Meals & Entertainment',
    memo: 'Client lunch — Q3 planning',
    status: { variant: BadgeVariant.WARNING, text: 'Needs review', subText: '2 suggestions' },
  },
  {
    id: 'r3',
    merchant: 'Figma',
    amount: '-$120.00',
    date: 'Jul 20',
    account: 'Amex ••1009',
    category: 'Software',
    memo: 'Annual subscription',
    status: { variant: BadgeVariant.NEUTRAL, text: 'Suggests a category', subText: 'Software' },
  },
  {
    id: 'r4',
    merchant: 'Stripe payout',
    amount: '+$3,480.12',
    date: 'Jul 19',
    account: 'Business Checking ••4821',
    category: 'Sales',
    memo: 'Weekly settlement',
    status: { variant: BadgeVariant.INFO, text: 'Matched to deposit' },
  },
]

const OVERFLOW_ROW: Row = {
  id: 'r5',
  merchant: 'Pacific Northwest Commercial Interiors & Facilities Management LLC',
  amount: '-$12,904.77',
  date: 'Jul 18',
  account: 'Business Checking ••4821 · Statement 07/2026 · Reference 88401-22',
  category: 'Contractors',
  memo: 'Tenant improvement — phase 2 of 3, retainage withheld',
  status: {
    variant: BadgeVariant.ERROR,
    text: 'Missing receipt for a transaction over the documentation threshold',
    subText: 'Overdue',
  },
}

const GROUPED: MobileListData<Row> = {
  groups: [
    { label: 'July 2026', items: ROWS.slice(0, 2) },
    { label: 'June 2026', items: ROWS.slice(2) },
  ],
}

const STATUS_ICONS = {
  [BadgeVariant.DEFAULT]: Car,
  [BadgeVariant.INFO]: Clock,
  [BadgeVariant.SUCCESS]: CircleCheck,
  [BadgeVariant.WARNING]: TriangleAlert,
  [BadgeVariant.ERROR]: TriangleAlert,
  [BadgeVariant.NEUTRAL]: CornerDownRight,
}

const renderItem = (row: Row) => (
  <MobileListItemContent
    title={row.merchant}
    slots={{ Value: <Span weight='bold' numeric='tabular-nums'>{row.amount}</Span> }}
  >
    <Span size='sm' variant='subtle' ellipsis>{`${row.date} · ${row.account}`}</Span>
  </MobileListItemContent>
)

const renderFooter = (row: Row) => (
  <MobileListItemStatusFooter
    variant={row.status.variant}
    text={row.status.text}
    subText={row.status.subText}
    slots={{ Icon: STATUS_ICONS[row.status.variant] }}
  />
)

const EXPANDED_FIELDS = ['category', 'account', 'memo'] as const

const renderExpandedContent = (row: Row) => (
  <VStack gap='2xs' pi='sm' pb='sm'>
    {EXPANDED_FIELDS.map(field => (
      <HStack key={field} fluid justify='space-between' gap='sm'>
        <Span size='sm' variant='subtle' textCase='capitalize'>{field}</Span>
        <Span size='sm' align='right'>{row[field]}</Span>
      </HStack>
    ))}
  </VStack>
)

const ACTIONS_MENU: MobileListItemActionsMenuConfig<Row> = {
  ariaLabel: 'Transaction actions',
  getActions: () => [
    { key: 'edit', label: 'Edit', onClick: () => {}, slots: { Icon: Pencil } },
    { key: 'duplicate', label: 'Duplicate', onClick: () => {}, slots: { Icon: Copy } },
    { key: 'delete', label: 'Delete', onClick: () => {}, isDisabled: true, slots: { Icon: Trash2 } },
  ],
}

const EmptyState = () => <Span size='sm' variant='subtle'>No transactions in this range</Span>
const ErrorState = () => <Span size='sm' status='error'>Something went wrong</Span>

const BASE_ARGS = {
  data: ROWS,
  slots: { EmptyState, ErrorState },
  renderItem,
  isLoading: false,
  isError: false,
} satisfies Partial<MobileListProps<Row>>

const meta: Meta<typeof MobileList<Row>> = {
  title: 'Blocks/MobileList',
  component: MobileList,
  args: {
    ariaLabel: 'Transactions',
    variant: 'default',
    ...BASE_ARGS,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'compact'] },
    selectionMode: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
    enableSelection: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    isError: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof MobileList<Row>>

const Panel = ({
  label,
  note,
  ...overrides
}: { label: string, note?: string } & Partial<MobileListProps<Row>>) => (
  <Col label={label} inlineSize={340}>
    {note && <Span size='2xs' variant='subtle'>{note}</Span>}
    <Frame>
      <MobileList<Row> ariaLabel={label} {...BASE_ARGS} {...overrides} />
    </Frame>
  </Col>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280], delay: 500 } },
  render: () => (
    <Gallery direction='row' wrap gap={32}>
      <Panel label='Default' />
      <Panel label='Compact' variant='compact' />
      <Panel label='Grouped' data={GROUPED} />
      <Panel label='Grouped, compact' data={GROUPED} variant='compact' />
      <Panel label='Status footer' renderFooter={renderFooter} />
      <Panel label='Actions menu' slotProps={{ ActionsMenu: ACTIONS_MENU }} />
      <Panel
        label='Selectable'
        note='selected and unselected rows; an active selection suppresses the actions menu'
        enableSelection
        selectionMode='multiple'
        selectedKeys={new Set(['r1', 'r3'])}
        slotProps={{ ActionsMenu: ACTIONS_MENU }}
      />
      <Panel
        label='Expanded row'
        note='the footer collapses while the row is expanded'
        expandedKeys={new Set(['r2'])}
        renderFooter={renderFooter}
        renderExpandedContent={renderExpandedContent}
      />
      <Panel
        label='Everything at once'
        expandedKeys={new Set(['r1'])}
        renderFooter={renderFooter}
        renderExpandedContent={renderExpandedContent}
        slotProps={{ ActionsMenu: ACTIONS_MENU }}
        enableSelection
        selectionMode='multiple'
        selectedKeys={new Set()}
      />
      <Panel
        label='Overflowing content'
        data={[OVERFLOW_ROW, ...ROWS.slice(0, 1)]}
        renderFooter={renderFooter}
      />
      <Panel label='Single row' data={ROWS.slice(0, 1)} renderFooter={renderFooter} />
      <Panel label='Empty' data={[]} />
      <Panel label='Error' isError />
      <Panel label='Loading' data={undefined} isLoading />
      <Panel label='Loading, compact' data={undefined} isLoading variant='compact' />
    </Gallery>
  ),
}

const Anatomy = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <Col label={label} inlineSize={300}>
    <Frame>{children}</Frame>
  </Col>
)

export const Subcomponents: Story = {
  parameters: { chromatic: { viewports: [1280], delay: 300 } },
  render: () => (
    <Gallery direction='row' wrap gap={32}>
      <Anatomy label='Title only'>
        <MobileListItemContent title='Staples' />
      </Anatomy>
      <Anatomy label='Title and value'>
        <MobileListItemContent
          title='Staples'
          slots={{ Value: <Span weight='bold' numeric='tabular-nums'>-$42.00</Span> }}
        />
      </Anatomy>
      <Anatomy label='Wrapping detail'>
        <MobileListItemContent
          title='Figma'
          slots={{ Value: <Span weight='bold' numeric='tabular-nums'>-$120.00</Span> }}
        >
          <Span size='sm' variant='subtle'>
            Annual subscription renewed Jul 20, billed to Amex ••1009 and split across two
            cost centers
          </Span>
        </MobileListItemContent>
      </Anatomy>
      {Object.values(BadgeVariant).map(variant => (
        <Anatomy key={variant} label={`Status footer — ${variant}`}>
          <VStack gap='sm'>
            <MobileListItemStatusFooter variant={variant} text='Needs review' />
            <MobileListItemStatusFooter
              variant={variant}
              text='Needs review'
              slots={{ Icon: STATUS_ICONS[variant] }}
            />
            <MobileListItemStatusFooter
              variant={variant}
              text='Needs review'
              subText='2 suggestions'
              slots={{ Icon: STATUS_ICONS[variant] }}
            />
            <MobileListItemStatusFooter
              variant={variant}
              text='Missing receipt for a transaction over the documentation threshold'
              subText='Overdue'
              slots={{ Icon: STATUS_ICONS[variant] }}
            />
          </VStack>
        </Anatomy>
      ))}
    </Gallery>
  ),
}

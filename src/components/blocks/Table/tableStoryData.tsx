import type { Row } from '@tanstack/react-table'

import { Alignment } from '@internal-types/utility/table'
import { Badge, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'
import { Button } from '@ui/Button/Button'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import type { ColumnConfig } from '@blocks/Table/DataTable/utils/column'
import type { NestedColumnConfig } from '@blocks/Table/DataTable/utils/column/nesting'

export type InvoiceRow = {
  id: string
  reference: string
  customer: string
  customerEmail: string
  category: string
  owner: string
  status: 'Paid' | 'Sent' | 'Overdue' | 'Draft'
  amountCents: number
  outstandingCents: number
  dueDate: string
  lineItems: number
}

const BASE_ROWS: readonly Omit<InvoiceRow, 'id'>[] = [
  {
    reference: 'INV-1041',
    customer: 'Brightline Dental',
    customerEmail: 'ap@brightlinedental.com',
    category: 'Consulting',
    owner: 'Dana Whitfield',
    status: 'Paid',
    amountCents: 428_00,
    outstandingCents: 0,
    dueDate: 'Mar 4',
    lineItems: 3,
  },
  {
    reference: 'INV-1042',
    customer: 'Northgate Property Group',
    customerEmail: 'billing@northgatepg.com',
    category: 'Retainer',
    owner: 'Marco Ibarra',
    status: 'Sent',
    amountCents: 12_500_00,
    outstandingCents: 12_500_00,
    dueDate: 'Mar 11',
    lineItems: 1,
  },
  {
    reference: 'INV-1043',
    customer: 'Willow & Vine Catering',
    customerEmail: 'accounts@willowvine.co',
    category: 'Events',
    owner: 'Dana Whitfield',
    status: 'Overdue',
    amountCents: 3_275_50,
    outstandingCents: 1_100_00,
    dueDate: 'Feb 18',
    lineItems: 7,
  },
  {
    reference: 'INV-1044',
    customer: 'Cedar Peak Outfitters',
    customerEmail: 'finance@cedarpeak.com',
    category: 'Wholesale',
    owner: 'Priya Raman',
    status: 'Draft',
    amountCents: 890_00,
    outstandingCents: 890_00,
    dueDate: '—',
    lineItems: 2,
  },
  {
    reference: 'INV-1045',
    customer: 'Halcyon Veterinary Partners',
    customerEmail: 'ap@halcyonvet.com',
    category: 'Consulting',
    owner: 'Marco Ibarra',
    status: 'Paid',
    amountCents: 24_980_00,
    outstandingCents: 0,
    dueDate: 'Feb 28',
    lineItems: 12,
  },
  {
    reference: 'INV-1046',
    customer: 'Ironwood Fitness Collective',
    customerEmail: 'ops@ironwoodfit.com',
    category: 'Retainer',
    owner: 'Priya Raman',
    status: 'Sent',
    amountCents: 6_400_00,
    outstandingCents: 6_400_00,
    dueDate: 'Mar 21',
    lineItems: 4,
  },
  {
    reference: 'INV-1047',
    customer: 'Sable Creek Landscaping',
    customerEmail: 'invoices@sablecreek.com',
    category: 'Events',
    owner: 'Dana Whitfield',
    status: 'Overdue',
    amountCents: 1_150_25,
    outstandingCents: 1_150_25,
    dueDate: 'Jan 30',
    lineItems: 5,
  },
  {
    reference: 'INV-1048',
    customer: 'Meridian Optical',
    customerEmail: 'ap@meridianoptical.com',
    category: 'Wholesale',
    owner: 'Priya Raman',
    status: 'Paid',
    amountCents: 44_120_75,
    outstandingCents: 0,
    dueDate: 'Mar 2',
    lineItems: 9,
  },
]

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const formatCents = (cents: number) => currencyFormatter.format(cents / 100)

export const buildInvoiceRows = (count: number): InvoiceRow[] =>
  Array.from({ length: count }, (_unused, index) => {
    const base = BASE_ROWS[index % BASE_ROWS.length]
    const sequence = 1041 + index

    return {
      ...base,
      id: `invoice-${sequence}`,
      reference: `INV-${sequence}`,
      lineItems: base.lineItems + (index % 3),
    }
  })

export const INVOICE_ROWS = buildInvoiceRows(BASE_ROWS.length)

const STATUS_VARIANTS: Record<InvoiceRow['status'], BadgeVariant> = {
  Paid: BadgeVariant.SUCCESS,
  Sent: BadgeVariant.INFO,
  Overdue: BadgeVariant.ERROR,
  Draft: BadgeVariant.NEUTRAL,
}

const StatusCell = ({ status }: { status: InvoiceRow['status'] }) => (
  <Badge size={BadgeSize.SMALL} variant={STATUS_VARIANTS[status]}>{status}</Badge>
)

const CustomerCell = ({ row }: { row: InvoiceRow }) => (
  <VStack>
    <Span ellipsis>{row.customer}</Span>
    <Span size='sm' variant='subtle' ellipsis>{row.customerEmail}</Span>
  </VStack>
)

const AmountCell = ({ row }: { row: InvoiceRow }) => (
  <VStack>
    <Span>{formatCents(row.amountCents)}</Span>
    {row.outstandingCents > 0 && row.outstandingCents < row.amountCents && (
      <Span size='sm' variant='subtle'>{`${formatCents(row.outstandingCents)} outstanding`}</Span>
    )}
  </VStack>
)

const noop = () => {}

export const getInvoiceColumnConfig = (): ColumnConfig<InvoiceRow> => [
  {
    id: 'Reference',
    header: 'No.',
    cell: row => <Span weight='bold'>{row.original.reference}</Span>,
    isRowHeader: true,
  },
  {
    id: 'Customer',
    header: 'Customer',
    cell: row => <CustomerCell row={row.original} />,
  },
  {
    id: 'Category',
    header: 'Category',
    cell: row => <Span variant='subtle'>{row.original.category}</Span>,
  },
  {
    id: 'LineItems',
    header: 'Items',
    cell: row => <Span>{row.original.lineItems}</Span>,
    alignment: Alignment.Center,
  },
  {
    id: 'DueDate',
    header: 'Due',
    cell: row => <Span>{row.original.dueDate}</Span>,
  },
  {
    id: 'Amount',
    header: 'Amount',
    cell: row => <AmountCell row={row.original} />,
    alignment: Alignment.Right,
  },
  {
    id: 'Status',
    header: 'Status',
    cell: row => <StatusCell status={row.original.status} />,
    alignment: Alignment.Center,
  },
]

/**
 * Wide enough to overflow horizontally at every viewport, so the pinned first and last
 * columns stay put while the rest scrolls.
 */
export const getPinnedInvoiceColumnConfig = (): ColumnConfig<InvoiceRow> => [
  {
    id: 'Reference',
    header: 'No.',
    cell: row => <Span weight='bold'>{row.original.reference}</Span>,
    isRowHeader: true,
    pinning: 'left',
  },
  {
    id: 'Customer',
    header: 'Customer',
    cell: row => <CustomerCell row={row.original} />,
  },
  {
    id: 'Owner',
    header: 'Account owner',
    cell: row => <Span>{row.original.owner}</Span>,
  },
  {
    id: 'Category',
    header: 'Category',
    cell: row => <Span variant='subtle'>{row.original.category}</Span>,
  },
  {
    id: 'LineItems',
    header: 'Line items',
    cell: row => <Span>{row.original.lineItems}</Span>,
    alignment: Alignment.Center,
  },
  {
    id: 'DueDate',
    header: 'Due date',
    cell: row => <Span>{row.original.dueDate}</Span>,
  },
  {
    id: 'Outstanding',
    header: 'Outstanding',
    cell: row => <Span>{formatCents(row.original.outstandingCents)}</Span>,
    alignment: Alignment.Right,
  },
  {
    id: 'Amount',
    header: 'Invoice total',
    cell: row => <Span>{formatCents(row.original.amountCents)}</Span>,
    alignment: Alignment.Right,
  },
  {
    id: 'Status',
    header: 'Status',
    cell: row => <StatusCell status={row.original.status} />,
    alignment: Alignment.Center,
    pinning: 'right',
  },
  {
    id: 'Actions',
    header: '',
    cell: () => <Button variant='ghost' inset onPress={noop}>View</Button>,
    preventRowClick: true,
    pinning: 'right',
  },
]

export const InvoiceExpandedRow = ({ row }: { row: Row<InvoiceRow> }) => (
  <VStack gap='xs' pi='md' pb='sm'>
    <Span weight='bold'>{`${row.original.reference} · ${row.original.customer}`}</Span>
    <HStack gap='lg'>
      <Span size='sm' variant='subtle'>{`Owner: ${row.original.owner}`}</Span>
      <Span size='sm' variant='subtle'>{`Line items: ${row.original.lineItems}`}</Span>
      <Span size='sm' variant='subtle'>{`Outstanding: ${formatCents(row.original.outstandingCents)}`}</Span>
    </HStack>
  </VStack>
)

export type AccountNode = {
  accountId: string
  name: string
  accountType: string
  currentBalance: number
  priorBalance: number
  subAccounts?: AccountNode[]
}

export const ACCOUNT_TREE: AccountNode[] = [
  {
    accountId: 'assets',
    name: 'Assets',
    accountType: 'Asset',
    currentBalance: 412_800_00,
    priorBalance: 388_140_00,
    subAccounts: [
      {
        accountId: 'assets.current',
        name: 'Current assets',
        accountType: 'Asset',
        currentBalance: 214_300_00,
        priorBalance: 201_050_00,
        subAccounts: [
          { accountId: 'assets.current.checking', name: 'Business checking', accountType: 'Bank', currentBalance: 88_420_00, priorBalance: 79_310_00 },
          { accountId: 'assets.current.savings', name: 'Business savings', accountType: 'Bank', currentBalance: 95_000_00, priorBalance: 95_000_00 },
          { accountId: 'assets.current.ar', name: 'Accounts receivable', accountType: 'Receivable', currentBalance: 30_880_00, priorBalance: 26_740_00 },
        ],
      },
      {
        accountId: 'assets.fixed',
        name: 'Fixed assets',
        accountType: 'Asset',
        currentBalance: 198_500_00,
        priorBalance: 187_090_00,
        subAccounts: [
          { accountId: 'assets.fixed.equipment', name: 'Equipment', accountType: 'Asset', currentBalance: 142_500_00, priorBalance: 138_200_00 },
          { accountId: 'assets.fixed.vehicles', name: 'Vehicles', accountType: 'Asset', currentBalance: 56_000_00, priorBalance: 48_890_00 },
        ],
      },
    ],
  },
  {
    accountId: 'liabilities',
    name: 'Liabilities',
    accountType: 'Liability',
    currentBalance: 96_240_00,
    priorBalance: 104_610_00,
    subAccounts: [
      { accountId: 'liabilities.ap', name: 'Accounts payable', accountType: 'Payable', currentBalance: 41_240_00, priorBalance: 52_610_00 },
      { accountId: 'liabilities.card', name: 'Corporate card', accountType: 'Credit card', currentBalance: 15_000_00, priorBalance: 12_000_00 },
      { accountId: 'liabilities.loan', name: 'Equipment loan', accountType: 'Loan', currentBalance: 40_000_00, priorBalance: 40_000_00 },
    ],
  },
  {
    accountId: 'equity',
    name: 'Equity',
    accountType: 'Equity',
    currentBalance: 316_560_00,
    priorBalance: 283_530_00,
    subAccounts: [
      { accountId: 'equity.retained', name: 'Retained earnings', accountType: 'Equity', currentBalance: 268_560_00, priorBalance: 243_530_00 },
      { accountId: 'equity.contributions', name: 'Owner contributions', accountType: 'Equity', currentBalance: 48_000_00, priorBalance: 40_000_00 },
    ],
  },
]

export const getAccountSubRows = (node: AccountNode) => node.subAccounts
export const getAccountRowId = (node: AccountNode) => node.accountId

const DeltaCell = ({ node }: { node: AccountNode }) => {
  const delta = node.currentBalance - node.priorBalance

  if (delta === 0) return <Span variant='subtle'>—</Span>

  return (
    <Span variant={delta > 0 ? 'inherit' : 'subtle'}>
      {`${delta > 0 ? '+' : '−'}${formatCents(Math.abs(delta))}`}
    </Span>
  )
}

/** Two-tier header: a leaf `Account` column beside a `Balance` group of three leaves. */
export const getAccountColumnConfig = (): NestedColumnConfig<AccountNode> => [
  {
    id: 'Account',
    header: 'Account',
    cell: row => <Span>{row.original.name}</Span>,
    isRowHeader: true,
  },
  {
    id: 'AccountType',
    header: 'Type',
    cell: row => <Span variant='subtle'>{row.original.accountType}</Span>,
  },
  {
    id: 'Balance',
    header: 'Balance',
    alignment: Alignment.Center,
    columns: [
      {
        id: 'PriorBalance',
        header: 'Prior period',
        cell: row => <Span variant='subtle'>{formatCents(row.original.priorBalance)}</Span>,
        alignment: Alignment.Right,
      },
      {
        id: 'CurrentBalance',
        header: 'Current',
        cell: row => <Span weight='bold'>{formatCents(row.original.currentBalance)}</Span>,
        alignment: Alignment.Right,
      },
      {
        id: 'Delta',
        header: 'Change',
        cell: row => <DeltaCell node={row.original} />,
        alignment: Alignment.Right,
      },
    ],
  },
]

export const EmptyState = () => (
  <DataState
    status={DataStateStatus.allDone}
    title='No invoices yet'
    description='Invoices you create will show up here.'
    spacing
  />
)

export const ErrorState = () => (
  <DataState
    status={DataStateStatus.failed}
    title="We couldn't load invoices"
    description='Check the connection and try again.'
    spacing
  />
)

export const TABLE_STORY_SLOTS = { EmptyState, ErrorState }

export const TABLE_STORY_COMPONENT_NAME = 'TableStory'
export const PINNED_STORY_COMPONENT_NAME = 'TableStoryPinned'
export const ACCOUNTS_STORY_COMPONENT_NAME = 'TableStoryAccounts'

/**
 * Rows and header cells lay out as a CSS grid, so every table needs a `grid-template-columns`
 * keyed on its `componentName` — in features that lives in the feature's own stylesheet
 * (see `invoiceTable.scss`). Stories carry theirs inline, as `UI/Table` does.
 */
const STORY_STYLES = `
  .Layer__UI__Table__TableStory,
  .Layer__UI__Table__TableStoryPinned,
  .Layer__UI__Table__TableStoryAccounts {
    table-layout: fixed;
    width: 100%;
  }

  .Layer__UI__Table__TableStory {
    --table-story-columns: 6rem minmax(10rem, 1fr) 8rem 4.5rem 5.5rem 10rem 7rem;
  }

  .Layer__UI__Table__TableStory--8Columns {
    --table-story-columns: 3rem 6rem minmax(10rem, 1fr) 8rem 4.5rem 5.5rem 10rem 7rem;
  }

  .Layer__UI__Table__TableStoryPinned {
    --table-story-columns: 7rem 16rem 11rem 9rem 7rem 8rem 10rem 10rem 8rem 6rem;
  }

  .Layer__UI__Table__TableStoryAccounts {
    --table-story-columns: minmax(12rem, 1fr) 9rem 9rem 9rem 9rem;
  }

  .Layer__UI__Table__TableStory .Layer__UI__Table-Row:not(.Layer__DataTable__EmptyState__Row, .Layer__DataTable__ExpandedRow),
  .Layer__UI__Table__TableStoryPinned .Layer__UI__Table-Row:not(.Layer__DataTable__EmptyState__Row, .Layer__DataTable__ExpandedRow),
  .Layer__UI__Table__TableStoryAccounts .Layer__UI__Table-Row:not(.Layer__DataTable__EmptyState__Row, .Layer__DataTable__ExpandedRow),
  .Layer__UI__Table__TableStory .Layer__UI__Table-TableHeader > tr,
  .Layer__UI__Table__TableStoryPinned .Layer__UI__Table-TableHeader > tr,
  .Layer__UI__Table__TableStoryAccounts .Layer__UI__Table-TableHeader > tr,
  .Layer__UI__Table__TableStory .Layer__UI__VirtualizedTable__row,
  .Layer__UI__Table__TableStory .Layer__UI__VirtualizedTable__header > tr {
    display: grid;
    grid-template-columns: var(--table-story-columns);
  }

  /* The grouped header's Balance group sits above three leaf columns. */
  .Layer__UI__Table-Column__TableStoryAccounts--Balance {
    grid-column: span 3;
  }
`

export const TableStoryStyles = () => <style>{STORY_STYLES}</style>

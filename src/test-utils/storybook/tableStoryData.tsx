import type { Row } from '@tanstack/react-table'

import { Alignment } from '@internal-types/utility/table'
import { Badge, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'
import { Button } from '@ui/Button/Button'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import type { ColumnConfig } from '@blocks/Table/DataTable/utils/column'

import { customers } from '@fixtures/generated/customers.gen'

export type CustomerRow = (typeof customers)[number]

/**
 * The generated set is ten rows; longer tables cycle it, giving each repeat a distinct `id` so
 * TanStack's row keys stay unique.
 */
export const buildCustomerRows = (count: number): CustomerRow[] =>
  Array.from({ length: count }, (_unused, index) => {
    const base = customers[index % customers.length]

    return index < customers.length
      ? base
      : { ...base, id: `${base.id}-${index}` }
  })

export const CUSTOMER_ROWS = buildCustomerRows(customers.length)

const getCustomerName = (row: CustomerRow) => row.companyName ?? row.individualName ?? 'Unnamed'

const STATUS_VARIANTS: Record<CustomerRow['status'], BadgeVariant> = {
  ACTIVE: BadgeVariant.SUCCESS,
  ARCHIVED: BadgeVariant.NEUTRAL,
}

const StatusCell = ({ status }: { status: CustomerRow['status'] }) => (
  <Badge size={BadgeSize.SMALL} variant={STATUS_VARIANTS[status]}>{status}</Badge>
)

const NameCell = ({ row }: { row: CustomerRow }) => (
  <VStack>
    <Span ellipsis>{getCustomerName(row)}</Span>
    {row.companyName && row.individualName && (
      <Span size='sm' variant='subtle' ellipsis>{row.individualName}</Span>
    )}
  </VStack>
)

const ContactCell = ({ row }: { row: CustomerRow }) => (
  <VStack>
    <Span ellipsis>{row.email ?? '—'}</Span>
    <Span size='sm' variant='subtle' ellipsis>{row.mobilePhone ?? row.officePhone ?? 'No phone'}</Span>
  </VStack>
)

const noop = () => {}

export const getCustomerColumnConfig = (): ColumnConfig<CustomerRow> => [
  {
    id: 'Name',
    header: 'Customer',
    cell: row => <NameCell row={row.original} />,
    isRowHeader: true,
  },
  {
    id: 'Contact',
    header: 'Contact',
    cell: row => <ContactCell row={row.original} />,
  },
  {
    id: 'Address',
    header: 'Address',
    cell: row => <Span variant='subtle' ellipsis>{row.original.addressString ?? '—'}</Span>,
  },
  {
    id: 'Memo',
    header: 'Memo',
    cell: row => <Span variant='subtle' ellipsis>{row.original.memo ?? '—'}</Span>,
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
export const getPinnedCustomerColumnConfig = (): ColumnConfig<CustomerRow> => [
  {
    id: 'Name',
    header: 'Customer',
    cell: row => <Span weight='bold' ellipsis>{getCustomerName(row.original)}</Span>,
    isRowHeader: true,
    pinning: 'left',
  },
  {
    id: 'Contact',
    header: 'Contact',
    cell: row => <ContactCell row={row.original} />,
  },
  {
    id: 'Individual',
    header: 'Primary contact',
    cell: row => <Span ellipsis>{row.original.individualName ?? '—'}</Span>,
  },
  {
    id: 'Company',
    header: 'Company',
    cell: row => <Span variant='subtle' ellipsis>{row.original.companyName ?? '—'}</Span>,
  },
  {
    id: 'MobilePhone',
    header: 'Mobile',
    cell: row => <Span ellipsis>{row.original.mobilePhone ?? '—'}</Span>,
  },
  {
    id: 'OfficePhone',
    header: 'Office',
    cell: row => <Span ellipsis>{row.original.officePhone ?? '—'}</Span>,
  },
  {
    id: 'Address',
    header: 'Address',
    cell: row => <Span variant='subtle' ellipsis>{row.original.addressString ?? '—'}</Span>,
  },
  {
    id: 'Memo',
    header: 'Memo',
    cell: row => <Span variant='subtle' ellipsis>{row.original.memo ?? '—'}</Span>,
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

export const CustomerExpandedRow = ({ row }: { row: Row<CustomerRow> }) => (
  <VStack gap='xs' pi='md' pb='sm'>
    <Span weight='bold'>{getCustomerName(row.original)}</Span>
    <HStack gap='lg'>
      <Span size='sm' variant='subtle'>{`Email: ${row.original.email ?? '—'}`}</Span>
      <Span size='sm' variant='subtle'>{`Mobile: ${row.original.mobilePhone ?? '—'}`}</Span>
      <Span size='sm' variant='subtle'>{`Address: ${row.original.addressString ?? '—'}`}</Span>
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

  return <MoneySpan variant={delta > 0 ? 'inherit' : 'subtle'} amount={delta} displayPlusSign />
}

export const getAccountColumnConfig = (): ColumnConfig<AccountNode> => [
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
    id: 'PriorBalance',
    header: 'Prior period',
    cell: row => <MoneySpan variant='subtle' amount={row.original.priorBalance} />,
    alignment: Alignment.Right,
  },
  {
    id: 'CurrentBalance',
    header: 'Current',
    cell: row => <MoneySpan weight='bold' amount={row.original.currentBalance} />,
    alignment: Alignment.Right,
  },
  {
    id: 'Delta',
    header: 'Change',
    cell: row => <DeltaCell node={row.original} />,
    alignment: Alignment.Right,
  },
]

export const EmptyState = () => (
  <DataState
    status={DataStateStatus.allDone}
    title='No customers yet'
    description='Customers you add will show up here.'
    spacing
  />
)

export const ErrorState = () => (
  <DataState
    status={DataStateStatus.failed}
    title="We couldn't load customers"
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
    --table-story-columns: minmax(12rem, 1fr) 14rem 16rem 12rem 7rem;
  }

  .Layer__UI__Table__TableStory--6Columns {
    --table-story-columns: 3rem minmax(12rem, 1fr) 14rem 16rem 12rem 7rem;
  }

  .Layer__UI__Table__TableStoryPinned {
    --table-story-columns: 12rem 14rem 11rem 11rem 9rem 9rem 16rem 12rem 8rem 6rem;
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

  /* The detail row's colSpan cell is a real table cell, so it would otherwise drive the table's
     column widths and collapse the grid rows to its content. */
  .Layer__UI__Table__TableStory .Layer__DataTable__ExpandedRow {
    display: grid;
    grid-template-columns: 100%;
  }
`

export const TableStoryStyles = () => <style>{STORY_STYLES}</style>

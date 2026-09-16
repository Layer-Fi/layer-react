import { Alignment } from '@internal-types/utility/table'
import { pickCyclic } from '@utils/shared/array/pickCyclic'
import { Badge, BadgeSize, BadgeVariant } from '@ui/Badge/Badge'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { VStack } from '@ui/Stack/Stack'
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
    const base = pickCyclic(customers, index)

    return index < customers.length
      ? base
      : { ...base, id: `${base.id}-${index}` }
  })

export const getCustomerName = (row: CustomerRow) => row.companyName ?? row.individualName ?? 'Unnamed'

const STATUS_VARIANTS: Record<CustomerRow['status'], BadgeVariant> = {
  ACTIVE: BadgeVariant.SUCCESS,
  ARCHIVED: BadgeVariant.NEUTRAL,
}

export const StatusCell = ({ status }: { status: CustomerRow['status'] }) => (
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

export const ContactCell = ({ row }: { row: CustomerRow }) => (
  <VStack>
    <Span ellipsis>{row.email ?? '—'}</Span>
    <Span size='sm' variant='subtle' ellipsis>{row.mobilePhone ?? row.officePhone ?? 'No phone'}</Span>
  </VStack>
)

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

const EmptyState = () => (
  <DataState
    status={DataStateStatus.allDone}
    title='No customers yet'
    description='Customers you add will show up here.'
    spacing
  />
)

const ErrorState = () => (
  <DataState
    status={DataStateStatus.failed}
    title="We couldn't load customers"
    description='Check the connection and try again.'
    spacing
  />
)

export const TABLE_STORY_SLOTS = { EmptyState, ErrorState }

export const TABLE_STORY_COMPONENT_NAME = 'TableStory'

/**
 * Rows and header cells lay out as a CSS grid, so every table needs a `grid-template-columns`
 * keyed on its `componentName` — in features that lives in the feature's own stylesheet
 * (see `invoiceTable.scss`). Stories carry theirs inline, as `UI/Table` does.
 */
const buildTableStoryGridStyles = (componentName: string, columns: string) => `
  .Layer__UI__Table__${componentName} {
    table-layout: fixed;
    width: 100%;
    --table-story-columns: ${columns};
  }

  .Layer__UI__Table__${componentName} .Layer__UI__Table-Row:not(.Layer__DataTable__EmptyState__Row, .Layer__DataTable__ExpandedRow),
  .Layer__UI__Table__${componentName} .Layer__UI__Table-TableHeader > tr {
    display: grid;
    grid-template-columns: var(--table-story-columns);
  }
`

export const TableStoryGridStyles = ({ componentName, columns }: { componentName: string, columns: string }) => (
  <style>{buildTableStoryGridStyles(componentName, columns)}</style>
)

const STORY_STYLES = `
  ${buildTableStoryGridStyles(TABLE_STORY_COMPONENT_NAME, 'minmax(12rem, 1fr) 14rem 16rem 12rem 7rem')}

  .Layer__UI__Table__TableStory--6Columns {
    --table-story-columns: 3rem minmax(12rem, 1fr) 14rem 16rem 12rem 7rem;
  }

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

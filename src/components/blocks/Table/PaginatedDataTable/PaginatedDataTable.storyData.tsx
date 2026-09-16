import { Alignment } from '@internal-types/utility/table'
import { Button } from '@ui/Button/Button'
import { Span } from '@ui/Typography/Text'
import type { ColumnConfig } from '@blocks/Table/DataTable/utils/column'

import {
  ContactCell,
  type CustomerRow,
  getCustomerName,
  StatusCell,
} from '@testUtils/storybook/data/tables'

const noop = () => {}

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

export const PINNED_STORY_COMPONENT_NAME = 'TableStoryPinned'
export const PINNED_STORY_COLUMNS = '12rem 14rem 11rem 11rem 9rem 9rem 16rem 12rem 8rem 6rem'

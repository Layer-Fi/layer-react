import type { Row } from '@tanstack/react-table'

import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import { customers } from '@fixtures/generated/customers.gen'
import { buildCustomerRows, type CustomerRow, getCustomerName } from '@testUtils/storybook/data/tables'

export const CUSTOMER_ROWS = buildCustomerRows(customers.length)

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

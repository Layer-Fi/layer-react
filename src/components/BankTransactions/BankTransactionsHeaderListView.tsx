import classNames from 'classnames'

import { HStack, VStack } from '@ui/Stack/Stack'
import { Header } from '@components/Container/Header'

import type { BankTransactionsHeaderSharedProps } from './BankTransactionsHeader'

export function BankTransactionsHeaderListView({
  shiftStickyHeader,
  withDatePicker,
  mobileComponent,
  showBulkActions,
  headerTopRow,
  statusToggle,
  bulkActionsModule,
  transactionsSearch,
}: BankTransactionsHeaderSharedProps) {
  return (
    <Header
      className={classNames(
        'Layer__bank-transactions__header',
        'Layer__bank-transactions__header--list-view',
        withDatePicker && 'Layer__bank-transactions__header--with-date-picker',
        mobileComponent && 'Layer__bank-transactions__header--mobile',
      )}
      style={{ top: shiftStickyHeader }}
    >
      <VStack gap='xs'>
        {headerTopRow}

        <HStack justify='space-between' align='center' gap='xs'>
          {showBulkActions ? bulkActionsModule : statusToggle}
        </HStack>

        {transactionsSearch}
      </VStack>
    </Header>
  )
}

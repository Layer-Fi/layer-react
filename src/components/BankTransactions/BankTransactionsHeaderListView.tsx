import classNames from 'classnames'

import { HStack, VStack } from '@ui/Stack/Stack'
import { Header } from '@components/Container/Header'

import './BankTransactionsHeaderListView.scss'

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
        'Layer__BankTransactionsHeaderListView',
        withDatePicker && 'Layer__BankTransactionsHeaderListView--with-date-picker',
        mobileComponent && 'Layer__BankTransactionsHeaderListView--mobile',
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

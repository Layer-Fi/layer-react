import { useMemo } from 'react'
import type { Row } from '@tanstack/react-table'

import type { MinimalBankTransaction } from '@schemas/bankTransactions/base'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import { VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import type { NestedColumnConfig } from '@components/DataTable/columnUtils'
import { DateTime } from '@components/DateTime/DateTime'
import { TextSize, TextWeight } from '@components/Typography/Text'
import { VirtualizedDataTable } from '@components/VirtualizedDataTable/VirtualizedDataTable'

import './affectedTransactionsTable.scss'

const COMPONENT_NAME = 'AffectedTransactionsTable'

enum TransactionColumns {
  Date = 'Date',
  Description = 'Description',
  Amount = 'Amount',
}

export interface AffectedTransactionsTableProps {
  transactions: MinimalBankTransaction[]
  isLoading?: boolean
  isError?: boolean
}

const ErrorState = () => (
  <DataState
    spacing
    status={DataStateStatus.failed}
    title='Error loading transactions'
    description='There was an error loading the affected transactions'
  />
)

const EmptyState = () => (
  <DataState
    spacing
    status={DataStateStatus.info}
    title='No transactions found'
    description='There are no affected transactions to display'
  />
)

export const AffectedTransactionsTable = ({
  transactions,
  isLoading = false,
  isError = false,
}: AffectedTransactionsTableProps) => {
  type AffectedTransactionRowType = Row<MinimalBankTransaction>
  const columnConfig: NestedColumnConfig<MinimalBankTransaction> = useMemo(() => [
    {
      id: TransactionColumns.Date,
      header: 'Date',
      cell: (row: AffectedTransactionRowType) => (
        <DateTime
          valueAsDate={row.original.date}
          onlyDate
          slotProps={
            { Date: { size: TextSize.md, weight: TextWeight.normal, variant: 'subtle' } }
          }
        />
      ),
    },
    {
      id: TransactionColumns.Description,
      header: 'Description',
      cell: (row: AffectedTransactionRowType) => (
        <Span withTooltip>
          {row.original.counterpartyName || row.original.description || '-'}
        </Span>
      ),
      isRowHeader: true,
    },
    {
      id: TransactionColumns.Amount,
      header: 'Amount',
      cell: (row: AffectedTransactionRowType) => {
        const amount = row.original.direction === BankTransactionDirection.Credit ? row.original.amount : -row.original.amount
        return <MoneySpan amount={amount} />
      },
    },
  ], [])

  return (
    <VStack className='Layer__AffectedTransactionsTable'>
      <VirtualizedDataTable<MinimalBankTransaction>
        componentName={COMPONENT_NAME}
        ariaLabel='Affected transactions'
        columnConfig={columnConfig}
        data={transactions}
        isLoading={isLoading}
        isError={isError}
        height={500}
        shrinkHeightToFitRows
        slots={{
          EmptyState,
          ErrorState,
        }}
      />
    </VStack>
  )
}

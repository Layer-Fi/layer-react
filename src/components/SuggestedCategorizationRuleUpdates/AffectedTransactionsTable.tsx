import { useMemo } from 'react'
import { VirtualizedDataTable } from '../VirtualizedDataTable/VirtualizedDataTable'
import { type ColumnConfig } from '../DataTable/DataTable'
import { DateTime } from '../DateTime'
import { TextSize, TextWeight } from '../Typography'
import { MoneySpan } from '../ui/Typography/MoneyText'
import { DataState, DataStateStatus } from '../DataState/DataState'
import type { MinimalBankTransaction } from '../../schemas/bankTransactions/base'
import { BankTransactionDirection } from '../../schemas/bankTransactions/base'
import { VStack } from '../ui/Stack/Stack'
import { Span } from '../ui/Typography/Text'

const COMPONENT_NAME = 'AffectedTransactionsTable'

enum TransactionColumns {
  Date = 'Date',
  Counterparty = 'Counterparty',
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
  const columnConfig: ColumnConfig<MinimalBankTransaction, TransactionColumns> = useMemo(() => ({
    [TransactionColumns.Date]: {
      id: TransactionColumns.Date,
      header: 'Date',
      cell: row => (
        <DateTime
          valueAsDate={row.date}
          onlyDate
          slotProps={
            { Date: { size: TextSize.md, weight: TextWeight.normal, variant: 'subtle' } }
          }
        />
      ),
    },
    [TransactionColumns.Counterparty]: {
      id: TransactionColumns.Counterparty,
      header: 'Counterparty',
      cell: row => (
        <Span
          ellipsis
        >
          {row.counterpartyName || '-'}
        </Span>
      ),
    },
    [TransactionColumns.Description]: {
      id: TransactionColumns.Description,
      header: 'Description',
      cell: row => (
        <Span
          ellipsis
        >
          {row.description || '-'}
        </Span>
      ),
      isRowHeader: true,
    },
    [TransactionColumns.Amount]: {
      id: TransactionColumns.Amount,
      header: 'Amount',
      cell: (row) => {
        const amount = row.direction === BankTransactionDirection.Credit ? row.amount : -row.amount
        return <MoneySpan amount={amount} />
      },
    },
  }), [])

  return (
    <VStack className='Layer__AffectedTransactionsTable'>
      <VirtualizedDataTable<MinimalBankTransaction, TransactionColumns>
        componentName={COMPONENT_NAME}
        ariaLabel='Affected transactions'
        columnConfig={columnConfig}
        data={transactions}
        isLoading={isLoading}
        isError={isError}
        height={500}
        slots={{
          EmptyState,
          ErrorState,
        }}
      />
    </VStack>
  )
}

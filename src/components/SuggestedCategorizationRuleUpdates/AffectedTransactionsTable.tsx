import { useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

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

const ErrorState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      spacing
      status={DataStateStatus.failed}
      title={t('categorizationRules:error.load_transactions', 'Error loading transactions')}
      description={t('categorizationRules:error.load_affected_transactions', 'There was an error loading the affected transactions')}
    />
  )
}

const EmptyState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      spacing
      status={DataStateStatus.info}
      title={t('bankTransactions:empty.no_transactions_found', 'No transactions found')}
      description={t('bankTransactions:label.affected_transaction_display', 'There are no affected transactions to display')}
    />
  )
}

export const AffectedTransactionsTable = ({
  transactions,
  isLoading = false,
  isError = false,
}: AffectedTransactionsTableProps) => {
  const { t } = useTranslation()

  type AffectedTransactionRowType = Row<MinimalBankTransaction>
  const columnConfig: NestedColumnConfig<MinimalBankTransaction> = useMemo(() => [
    {
      id: TransactionColumns.Date,
      header: t('common:label.date', 'Date'),
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
      header: t('common:label.description', 'Description'),
      cell: (row: AffectedTransactionRowType) => (
        <Span withTooltip>
          {row.original.counterpartyName || row.original.description || '-'}
        </Span>
      ),
      isRowHeader: true,
    },
    {
      id: TransactionColumns.Amount,
      header: t('common:label.amount', 'Amount'),
      cell: (row: AffectedTransactionRowType) => {
        const amount = row.original.direction === BankTransactionDirection.Credit ? row.original.amount : -row.original.amount
        return <MoneySpan amount={amount} />
      },
    },
  ], [t])

  return (
    <VStack className='Layer__AffectedTransactionsTable'>
      <VirtualizedDataTable<MinimalBankTransaction>
        componentName={COMPONENT_NAME}
        ariaLabel={t('bankTransactions:label.affected_transactions', 'Affected transactions')}
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

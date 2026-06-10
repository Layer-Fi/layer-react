import { useMemo } from 'react'
import { type Row } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { LedgerEntryDirection } from '@schemas/generalLedger/ledgerAccount'
import { type LedgerEntry } from '@schemas/generalLedger/ledgerEntry'
import { Alignment } from '@schemas/reports/unifiedReport'
import { sumLineItemAmountsByDirection } from '@utils/journal'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeVariant } from '@components/Badge/Badge'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { type LineItemsTableStringOverrides } from '@components/LedgerEntryDetails/types'
import { SimpleDataTable } from '@components/SimpleDataTable/SimpleDataTable'

import './lineItemsTable.scss'

const COMPONENT_NAME = 'LedgerEntryLineItems'

type LineItem = LedgerEntry['lineItems'][number]

type LineItemRow = {
  id: string
  account: string
  debit: number | null
  credit: number | null
  isTotal: boolean
}

interface LineItemsTableProps {
  lineItems: ReadonlyArray<LineItem> | undefined
  isLoading?: boolean
  isError?: boolean
  stringOverrides?: LineItemsTableStringOverrides
}

const AmountCell = ({
  amount,
  isTotal,
  variant,
}: {
  amount: number | null
  isTotal: boolean
  variant: BadgeVariant
}) => {
  const { formatCurrencyFromCents } = useIntlFormatter()

  if (amount === null) {
    return null
  }

  if (isTotal) return <Span weight='bold'>{formatCurrencyFromCents(amount)}</Span>

  return <Badge variant={variant}>{formatCurrencyFromCents(amount)}</Badge>
}

export const LineItemsTable = ({
  lineItems,
  isLoading,
  isError,
  stringOverrides,
}: LineItemsTableProps) => {
  const { t } = useTranslation()

  const rows = useMemo<LineItemRow[]>(() => {
    if (!lineItems?.length) return []

    // Surface debits before credits, mirroring the journal entry ordering.
    const sorted = lineItems
      .slice()
      .sort((a, b) => (a.direction > b.direction ? -1 : a.direction < b.direction ? 1 : 0))

    const itemRows = sorted.map((item, index): LineItemRow => ({
      id: item.id ?? `line-item-${index}`,
      account: item.account?.name ?? '',
      debit: item.direction === LedgerEntryDirection.Debit ? (item.amount || 0) : null,
      credit: item.direction === LedgerEntryDirection.Credit ? (item.amount || 0) : null,
      isTotal: false,
    }))

    const totalRow: LineItemRow = {
      id: 'total',
      account: '',
      debit: sumLineItemAmountsByDirection(lineItems, LedgerEntryDirection.Debit),
      credit: sumLineItemAmountsByDirection(lineItems, LedgerEntryDirection.Credit),
      isTotal: true,
    }

    return [...itemRows, totalRow]
  }, [lineItems])

  const columnConfig = useMemo<NestedColumnConfig<LineItemRow>>(() => [
    {
      id: 'account',
      header: stringOverrides?.lineItemsColumnHeader || t('generalLedger:label.line_items', 'Line items'),
      isRowHeader: true,
      cell: (row: Row<LineItemRow>) =>
        row.original.isTotal
          ? <Span weight='bold'>{stringOverrides?.totalRowHeader || t('common:label.total', 'Total')}</Span>
          : <Span>{row.original.account}</Span>,
    },
    {
      id: 'debit',
      header: stringOverrides?.debitColumnHeader || t('common:label.debit', 'Debit'),
      alignment: Alignment.Right,
      cell: (row: Row<LineItemRow>) => (
        <AmountCell amount={row.original.debit} isTotal={row.original.isTotal} variant={BadgeVariant.WARNING} />
      ),
    },
    {
      id: 'credit',
      header: stringOverrides?.creditColumnHeader || t('common:label.credit', 'Credit'),
      alignment: Alignment.Right,
      cell: (row: Row<LineItemRow>) => (
        <AmountCell amount={row.original.credit} isTotal={row.original.isTotal} variant={BadgeVariant.SUCCESS} />
      ),
    },
  ], [stringOverrides, t])

  const slots = useMemo(() => ({
    EmptyState: () => (
      <DataState
        status={DataStateStatus.info}
        title={t('generalLedger:empty.line_items', 'No line items')}
        description={t('generalLedger:empty.line_items_description', 'This entry has no line items.')}
        spacing
      />
    ),
    ErrorState: () => (
      <DataState
        status={DataStateStatus.failed}
        title={t('common:error.something_went_wrong', 'Something went wrong')}
        description={t('common:error.couldnt_load_data', 'We couldn’t load your data.')}
        spacing
      />
    ),
  }), [t])

  return (
    <div className='Layer__LedgerEntryDetails__LineItems'>
      <SimpleDataTable<LineItemRow>
        componentName={COMPONENT_NAME}
        ariaLabel={t('generalLedger:label.line_items', 'Line items')}
        columnConfig={columnConfig}
        data={rows}
        isLoading={Boolean(isLoading)}
        isError={Boolean(isError)}
        slots={slots}
      />
    </div>
  )
}

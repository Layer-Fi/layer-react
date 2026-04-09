import { useMemo } from 'react'
import { type Row } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { type TaxPaymentRow } from '@schemas/taxEstimates/payments'
import { asMutable } from '@utils/asMutable'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { ExpandableDataTable } from '@components/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { type CommonTaxPaymentsListProps } from '@components/TaxPayments/utils'

import './taxPaymentsTable.scss'

const COMPONENT_NAME = 'TaxPaymentsTable'

enum TaxPaymentColumns {
  Quarter = 'Quarter',
  RolledOverFromPrevious = 'RolledOverFromPrevious',
  Estimated = 'Estimated',
  Paid = 'Paid',
  RemainingBalance = 'RemainingBalance',
}

type TaxPaymentRowType = Row<TaxPaymentRow>

const getColumnConfig = (t: TFunction): NestedColumnConfig<TaxPaymentRow> => [
  {
    id: TaxPaymentColumns.Quarter,
    header: t('taxEstimates:label.quarter', 'Quarter'),
    cell: (row: TaxPaymentRowType) => <Span>{row.original.label}</Span>,
    isRowHeader: true,
  },
  {
    id: TaxPaymentColumns.RolledOverFromPrevious,
    header: t('taxEstimates:label.rolled_over_from_previous_quarter', 'Rolled Over From Previous Quarter'),
    cell: (row: TaxPaymentRowType) => <MoneySpan amount={row.original.rolledOverFromPrevious} />,
  },
  {
    id: TaxPaymentColumns.Estimated,
    header: t('taxEstimates:label.owed_quarter', 'Owed This Quarter'),
    cell: (row: TaxPaymentRowType) => <MoneySpan amount={row.original.owedThisQuarter} />,
  },
  {
    id: TaxPaymentColumns.Paid,
    header: t('taxEstimates:label.total_paid', 'Total Paid'),
    cell: (row: TaxPaymentRowType) => <MoneySpan amount={row.original.totalPaid} />,
  },
  {
    id: TaxPaymentColumns.RemainingBalance,
    header: t('taxEstimates:label.remaining_balance', 'Remaining Balance'),
    cell: (row: TaxPaymentRowType) => <MoneySpan amount={row.original.remainingBalance} />,
  },
]

const getSubRows = (row: TaxPaymentRow): TaxPaymentRow[] | undefined => row?.breakdown ? asMutable(row.breakdown) : undefined
const getRowId = (row: TaxPaymentRow): string => row.rowKey

export const TaxPaymentsTable = ({ data, isLoading, isError, slots }: CommonTaxPaymentsListProps) => {
  const { t } = useTranslation()
  const columnConfig = useMemo(() => getColumnConfig(t), [t])
  const mutableRows = data ? asMutable(data.data) : undefined

  return (
    <ExpandableDataTableProvider>
      <ExpandableDataTable
        componentName={COMPONENT_NAME}
        ariaLabel={t('taxEstimates:label.tax_payments', 'Tax Payments')}
        columnConfig={columnConfig}
        data={mutableRows}
        isLoading={isLoading}
        isError={isError}
        slots={slots}
        getSubRows={getSubRows}
        getRowId={getRowId}
      />
    </ExpandableDataTableProvider>
  )
}

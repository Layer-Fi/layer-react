import { type Row } from '@tanstack/react-table'
import i18next from 'i18next'

import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { SimpleDataTable } from '@components/SimpleDataTable/SimpleDataTable'
import { type CommonTaxPaymentsListProps, getQuarterLabel, type TaxPaymentQuarterWithId } from '@components/TaxPayments/utils'

import './taxPaymentsTable.scss'

const COMPONENT_NAME = 'TaxPaymentsTable'

enum TaxPaymentColumns {
  Quarter = 'Quarter',
  OwedFromPrevious = 'OwedFromPrevious',
  OwedThisQuarter = 'OwedThisQuarter',
  TotalPaid = 'TotalPaid',
  Total = 'Total',
}

type TaxPaymentRowType = Row<TaxPaymentQuarterWithId>

const columnConfig: NestedColumnConfig<TaxPaymentQuarterWithId> = [
  {
    id: TaxPaymentColumns.Quarter,
    header: i18next.t('quarter', 'Quarter'),
    cell: (row: TaxPaymentRowType) => (
      <Span>{getQuarterLabel(row.original.quarter)}</Span>
    ),
    isRowHeader: true,
  },
  {
    id: TaxPaymentColumns.OwedFromPrevious,
    header: i18next.t('rolledOverFromPreviousQuarter', 'Rolled Over From Previous Quarter'),
    cell: (row: TaxPaymentRowType) => (
      <MoneySpan amount={row.original.owedRolledOverFromPrevious} />
    ),
  },
  {
    id: TaxPaymentColumns.OwedThisQuarter,
    header: i18next.t('owedThisQuarter', 'Owed This Quarter'),
    cell: (row: TaxPaymentRowType) => (
      <MoneySpan amount={row.original.owedThisQuarter} />
    ),
  },
  {
    id: TaxPaymentColumns.TotalPaid,
    header: i18next.t('totalPaid', 'Total Paid'),
    cell: (row: TaxPaymentRowType) => (
      <MoneySpan amount={row.original.totalPaid} />
    ),
  },
  {
    id: TaxPaymentColumns.Total,
    header: i18next.t('remainingBalance', 'Remaining Balance'),
    cell: (row: TaxPaymentRowType) => (
      <MoneySpan amount={row.original.total} />
    ),
  },
]

export const TaxPaymentsTable = ({ data, isLoading, isError, slots }: CommonTaxPaymentsListProps) => {
  return (
    <SimpleDataTable<TaxPaymentQuarterWithId>
      componentName={COMPONENT_NAME}
      ariaLabel={i18next.t('taxPayments', 'Tax Payments')}
      columnConfig={columnConfig}
      data={data}
      isLoading={isLoading}
      isError={isError}
      slots={slots}
    />
  )
}

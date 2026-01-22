import { type Row } from '@tanstack/react-table'

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
    header: 'Quarter',
    cell: (row: TaxPaymentRowType) => (
      <Span>{getQuarterLabel(row.original.quarter)}</Span>
    ),
    isRowHeader: true,
  },
  {
    id: TaxPaymentColumns.OwedFromPrevious,
    header: 'Rolled Over From Previous Quarter',
    cell: (row: TaxPaymentRowType) => (
      <MoneySpan amount={row.original.owedRolledOverFromPrevious} />
    ),
  },
  {
    id: TaxPaymentColumns.OwedThisQuarter,
    header: 'Owed This Quarter',
    cell: (row: TaxPaymentRowType) => (
      <MoneySpan amount={row.original.owedThisQuarter} />
    ),
  },
  {
    id: TaxPaymentColumns.TotalPaid,
    header: 'Total Paid',
    cell: (row: TaxPaymentRowType) => (
      <MoneySpan amount={row.original.totalPaid} />
    ),
  },
  {
    id: TaxPaymentColumns.Total,
    header: 'Remaining Balance',
    cell: (row: TaxPaymentRowType) => (
      <MoneySpan amount={row.original.total} />
    ),
  },
]

export const TaxPaymentsTable = ({ data, isLoading, isError, slots }: CommonTaxPaymentsListProps) => {
  return (
    <SimpleDataTable<TaxPaymentQuarterWithId>
      componentName={COMPONENT_NAME}
      ariaLabel='Tax payments'
      columnConfig={columnConfig}
      data={data}
      isLoading={isLoading}
      isError={isError}
      slots={slots}
    />
  )
}

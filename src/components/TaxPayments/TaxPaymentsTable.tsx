import { useMemo } from 'react'
import { type Row } from '@tanstack/react-table'

import { type TaxPaymentQuarter } from '@schemas/taxEstimates/payments'
import { useTaxPayments } from '@hooks/taxEstimates/useTaxPayments'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { SimpleDataTable } from '@components/SimpleDataTable/SimpleDataTable'

import './taxPaymentsTable.scss'

const COMPONENT_NAME = 'TaxPaymentsTable'

enum TaxPaymentColumns {
  Quarter = 'Quarter',
  OwedFromPrevious = 'OwedFromPrevious',
  OwedThisQuarter = 'OwedThisQuarter',
  TotalPaid = 'TotalPaid',
  Total = 'Total',
}

type TaxPaymentQuarterWithId = TaxPaymentQuarter & { id: string }

const ErrorState = () => (
  <DataState
    spacing
    status={DataStateStatus.failed}
    title='Error loading tax payments'
    description='There was an error loading the tax payments'
  />
)

const EmptyState = () => (
  <DataState
    spacing
    status={DataStateStatus.info}
    title='No tax payments found'
    description='There are no tax payments to display'
  />
)

const getQuarterLabel = (quarter: number): string => {
  return `Q${quarter}`
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

export const TaxPaymentsTable = () => {
  const { startDate } = useGlobalDateRange({ dateSelectionMode: 'year' })
  const { data, isLoading, isError } = useTaxPayments({ year: startDate.getFullYear() })

  const dataWithIds = useMemo(
    () => data?.quarters.map(q => ({ ...q, id: `${q.quarter}` })),
    [data?.quarters],
  )

  return (
    <SimpleDataTable<TaxPaymentQuarterWithId>
      componentName={COMPONENT_NAME}
      ariaLabel='Tax payments'
      columnConfig={columnConfig}
      data={dataWithIds}
      isLoading={isLoading}
      isError={isError}
      slots={{
        EmptyState,
        ErrorState,
      }}
    />
  )
}

import { useMemo } from 'react'
import { type Row } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

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

const getColumnConfig = (t: TFunction): NestedColumnConfig<TaxPaymentQuarterWithId> => [
  {
    id: TaxPaymentColumns.Quarter,
    header: t('quarter', 'Quarter'),
    cell: (row: TaxPaymentRowType) => (
      <Span>{getQuarterLabel(row.original.quarter)}</Span>
    ),
    isRowHeader: true,
  },
  {
    id: TaxPaymentColumns.OwedFromPrevious,
    header: t('rolledOverFromPreviousQuarter', 'Rolled Over From Previous Quarter'),
    cell: (row: TaxPaymentRowType) => (
      <MoneySpan amount={row.original.owedRolledOverFromPrevious} />
    ),
  },
  {
    id: TaxPaymentColumns.OwedThisQuarter,
    header: t('owedThisQuarter', 'Owed This Quarter'),
    cell: (row: TaxPaymentRowType) => (
      <MoneySpan amount={row.original.owedThisQuarter} />
    ),
  },
  {
    id: TaxPaymentColumns.TotalPaid,
    header: t('totalPaid', 'Total Paid'),
    cell: (row: TaxPaymentRowType) => (
      <MoneySpan amount={row.original.totalPaid} />
    ),
  },
  {
    id: TaxPaymentColumns.Total,
    header: t('remainingBalance', 'Remaining Balance'),
    cell: (row: TaxPaymentRowType) => (
      <MoneySpan amount={row.original.total} />
    ),
  },
]

export const TaxPaymentsTable = ({ data, isLoading, isError, slots }: CommonTaxPaymentsListProps) => {
  const { t } = useTranslation()
  const columnConfig = useMemo(() => getColumnConfig(t), [t])

  return (
    <SimpleDataTable<TaxPaymentQuarterWithId>
      componentName={COMPONENT_NAME}
      ariaLabel={t('taxPayments', 'Tax Payments')}
      columnConfig={columnConfig}
      data={data}
      isLoading={isLoading}
      isError={isError}
      slots={slots}
    />
  )
}

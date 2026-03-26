import { useMemo } from 'react'
import { type Row } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { Separator } from '@components/Separator/Separator'
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

type TaxBreakdownItem = {
  label: string
  amount: number
}

const TaxPaymentAmountWithBreakdown = ({
  amount,
  breakdown,
}: {
  amount: number
  breakdown: TaxBreakdownItem[]
}) => (
  <VStack align='end' gap='3xs' className='Layer__TaxPaymentsTable__AmountWithBreakdown'>
    <VStack align='end' gap='3xs'>
      {breakdown.map(item => (
        <HStack key={item.label} gap='sm' className='Layer__TaxPaymentsTable__BreakdownRow'>
          <Span size='sm' variant='subtle'>{item.label}</Span>
          <MoneySpan size='sm' variant='subtle' amount={item.amount} />
        </HStack>
      ))}
    </VStack>
    <Separator mbs='3xs' mbe='3xs' />
    <HStack gap='3xs' align='center' className='Layer__TaxPaymentsTable__TotalRow'>
      <MoneySpan size='md' amount={amount} />
    </HStack>
  </VStack>
)

const getColumnConfig = (t: TFunction): NestedColumnConfig<TaxPaymentQuarterWithId> => {
  const federalTaxLabel = t('taxEstimates:label.federal_tax', 'Federal Tax')
  const stateTaxLabel = t('taxEstimates:label.state_tax', 'State Tax')
  const uncategorizedLabel = t('common:label.uncategorized', 'Uncategorized')

  return [
    {
      id: TaxPaymentColumns.Quarter,
      header: t('taxEstimates:label.quarter', 'Quarter'),
      cell: (row: TaxPaymentRowType) => (
        <Span>{getQuarterLabel(row.original.quarter)}</Span>
      ),
      isRowHeader: true,
    },
    {
      id: TaxPaymentColumns.OwedFromPrevious,
      header: t('taxEstimates:label.rolled_over_from_previous_quarter', 'Rolled Over From Previous Quarter'),
      cell: (row: TaxPaymentRowType) => (
        <MoneySpan amount={row.original.owedRolledOverFromPrevious} />
      ),
    },
    {
      id: TaxPaymentColumns.OwedThisQuarter,
      header: t('taxEstimates:label.owed_quarter', 'Owed This Quarter'),
      cell: (row: TaxPaymentRowType) => (
        <TaxPaymentAmountWithBreakdown
          amount={row.original.owedThisQuarter}
          breakdown={[
            { label: federalTaxLabel, amount: row.original.owedThisQuarterBreakdown.usFederal },
            { label: stateTaxLabel, amount: row.original.owedThisQuarterBreakdown.usState },
          ]}
        />
      ),
    },
    {
      id: TaxPaymentColumns.TotalPaid,
      header: t('taxEstimates:label.total_paid', 'Total Paid'),
      cell: (row: TaxPaymentRowType) => (
        <TaxPaymentAmountWithBreakdown
          amount={row.original.totalPaid}
          breakdown={[
            { label: federalTaxLabel, amount: row.original.totalPaidBreakdown.usFederal },
            { label: stateTaxLabel, amount: row.original.totalPaidBreakdown.usState },
            { label: uncategorizedLabel, amount: row.original.totalPaidBreakdown.uncategorized },
          ]}
        />
      ),
    },
    {
      id: TaxPaymentColumns.Total,
      header: t('taxEstimates:label.remaining_balance', 'Remaining Balance'),
      cell: (row: TaxPaymentRowType) => (
        <MoneySpan amount={row.original.total} />
      ),
    },
  ]
}

export const TaxPaymentsTable = ({ data, isLoading, isError, slots }: CommonTaxPaymentsListProps) => {
  const { t } = useTranslation()
  const columnConfig = useMemo(() => getColumnConfig(t), [t])

  return (
    <SimpleDataTable<TaxPaymentQuarterWithId>
      componentName={COMPONENT_NAME}
      ariaLabel={t('taxEstimates:label.tax_payments', 'Tax Payments')}
      columnConfig={columnConfig}
      data={data}
      isLoading={isLoading}
      isError={isError}
      slots={slots}
    />
  )
}

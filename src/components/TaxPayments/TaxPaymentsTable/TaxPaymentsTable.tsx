import { useMemo } from 'react'
import { type Row } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { ExpandableDataTable } from '@components/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { type CommonTaxPaymentsListProps, getQuarterLabel, type TaxPaymentQuarterWithId } from '@components/TaxPayments/utils'

import './taxPaymentsTable.scss'

const COMPONENT_NAME = 'TaxPaymentsTable'

enum TaxPaymentColumns {
  Quarter = 'Quarter',
  RolledOverFromPrevious = 'RolledOverFromPrevious',
  Estimated = 'Estimated',
  Paid = 'Paid',
  RemainingBalance = 'RemainingBalance',
}

type TaxPaymentTableRow = {
  id: string
  label: string
  rolledOverFromPreviousQuarter: number
  remainingBalance: number
  estimated: number
  paid: number
  subRows?: TaxPaymentTableRow[]
}

type TaxPaymentRowType = Row<TaxPaymentTableRow>

const getColumnConfig = (t: TFunction): NestedColumnConfig<TaxPaymentTableRow> => [
  {
    id: TaxPaymentColumns.Quarter,
    header: t('taxEstimates:label.quarter', 'Quarter'),
    cell: (row: TaxPaymentRowType) => <Span>{row.original.label}</Span>,
    isRowHeader: true,
  },
  {
    id: TaxPaymentColumns.RolledOverFromPrevious,
    header: t('taxEstimates:label.rolled_over_from_previous_quarter', 'Rolled Over From Previous Quarter'),
    cell: (row: TaxPaymentRowType) => <MoneySpan amount={row.original.rolledOverFromPreviousQuarter} />,
  },
  {
    id: TaxPaymentColumns.Estimated,
    header: t('taxEstimates:label.owed_quarter', 'Owed This Quarter'),
    cell: (row: TaxPaymentRowType) => <MoneySpan amount={row.original.estimated} />,
  },
  {
    id: TaxPaymentColumns.Paid,
    header: t('taxEstimates:label.total_paid', 'Total Paid'),
    cell: (row: TaxPaymentRowType) => <MoneySpan amount={row.original.paid} />,
  },
  {
    id: TaxPaymentColumns.RemainingBalance,
    header: t('taxEstimates:label.remaining_balance', 'Remaining Balance'),
    cell: (row: TaxPaymentRowType) => <MoneySpan amount={row.original.remainingBalance} />,
  },
]

const getSubRows = (row: TaxPaymentTableRow): TaxPaymentTableRow[] | undefined => row.subRows
const getRowId = (row: TaxPaymentTableRow): string => row.id

const getTableRows = (
  data: TaxPaymentQuarterWithId[] | undefined,
  t: TFunction,
): TaxPaymentTableRow[] | undefined => {
  if (!data) return undefined

  let previousFederalRolledOver = 0
  let previousStateRolledOver = 0

  return data.map((payment) => {
    const federalEstimated = payment.owedThisQuarterBreakdown.usFederal
    const federalPaid = payment.totalPaidBreakdown.usFederal
    const federalCumulativeTaxesOwed = previousFederalRolledOver + federalEstimated
    const federalRemainingBalance = federalCumulativeTaxesOwed - federalPaid

    const stateEstimated = payment.owedThisQuarterBreakdown.usState
    const statePaid = payment.totalPaidBreakdown.usState
    const stateCumulativeTaxesOwed = previousStateRolledOver + stateEstimated
    const stateRemainingBalance = stateCumulativeTaxesOwed - statePaid

    const row: TaxPaymentTableRow = {
      id: payment.id,
      label: getQuarterLabel(payment.quarter),
      rolledOverFromPreviousQuarter: payment.owedRolledOverFromPrevious,
      remainingBalance: payment.total,
      estimated: payment.owedThisQuarter,
      paid: payment.totalPaid,
      subRows: [
        {
          id: `${payment.id}-federal`,
          label: t(
            'taxEstimates:label.federal_income_self_employment_taxes',
            'Federal Income + Self-Employment Taxes',
          ),
          rolledOverFromPreviousQuarter: previousFederalRolledOver,
          remainingBalance: federalRemainingBalance,
          estimated: federalEstimated,
          paid: federalPaid,
        },
        {
          id: `${payment.id}-state`,
          label: t('taxEstimates:label.state_taxes', 'State Taxes'),
          rolledOverFromPreviousQuarter: previousStateRolledOver,
          remainingBalance: stateRemainingBalance,
          estimated: stateEstimated,
          paid: statePaid,
        },
        ...(payment.totalPaidBreakdown.uncategorized !== 0
          ? [{
            id: `${payment.id}-uncategorized`,
            label: t('taxEstimates:label.uncategorized_tax_payment', 'Uncategorized Tax Payment'),
            rolledOverFromPreviousQuarter: 0,
            remainingBalance: 0,
            estimated: 0,
            paid: payment.totalPaidBreakdown.uncategorized,
          }]
          : []),
      ],
    }

    previousFederalRolledOver = federalRemainingBalance
    previousStateRolledOver = stateRemainingBalance

    return row
  })
}

export const TaxPaymentsTable = ({ data, isLoading, isError, slots }: CommonTaxPaymentsListProps) => {
  const { t } = useTranslation()
  const columnConfig = useMemo(() => getColumnConfig(t), [t])
  const tableRows = useMemo(() => getTableRows(data, t), [data, t])

  return (
    <ExpandableDataTableProvider>
      <ExpandableDataTable<TaxPaymentTableRow>
        componentName={COMPONENT_NAME}
        ariaLabel={t('taxEstimates:label.tax_payments', 'Tax Payments')}
        columnConfig={columnConfig}
        data={tableRows}
        isLoading={isLoading}
        isError={isError}
        slots={slots}
        getSubRows={getSubRows}
        getRowId={getRowId}
        expandOnRowClick
      />
    </ExpandableDataTableProvider>
  )
}

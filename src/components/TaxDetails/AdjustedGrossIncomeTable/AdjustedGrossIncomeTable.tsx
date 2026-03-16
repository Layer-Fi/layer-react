import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type AdjustedGrossIncome, type Deductions } from '@schemas/taxEstimates/details'
import { Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { TaxTableRow, TaxTableRowVariant } from '@components/TaxDetails/TaxTable/TaxTable'

type DeductionRowConfig = {
  key: string
  label: string
  getAmount: (deductions: Deductions) => number
}

type AdjustedGrossIncomeTableProps = {
  data: AdjustedGrossIncome
}

export const AdjustedGrossIncomeTable = ({ data }: AdjustedGrossIncomeTableProps) => {
  const { t } = useTranslation()
  const { income, deductions, totalAdjustedGrossIncome } = data

  const deductionRows: DeductionRowConfig[] = useMemo(() => [
    { key: 'businessExpenses', label: t('taxEstimates:deductibleExpenses', 'Deductible Expenses'), getAmount: d => d.businessExpenses },
    { key: 'vehicleExpense', label: t('taxEstimates:deductibleMileageExpenses', 'Deductible Mileage Expenses'), getAmount: d => d.vehicleExpense?.amount ?? 0 },
    { key: 'homeOffice', label: t('taxEstimates:homeOfficeDeduction', 'Home Office Deduction'), getAmount: d => d.homeOffice?.amount ?? 0 },
    { key: 'selfEmploymentTaxDeduction', label: t('taxEstimates:selfEmploymentDeduction', 'Self-Employment Deduction'), getAmount: d => d.selfEmploymentTaxDeduction },
    { key: 'qualifiedTipDeduction', label: t('taxEstimates:qualifiedTipDeduction', 'Qualified Tip Deduction'), getAmount: d => d.qualifiedTipDeduction },
    { key: 'qualifiedOvertimeDeduction', label: t('taxEstimates:qualifiedOvertimeDeduction', 'Qualified Overtime Deduction'), getAmount: d => d.qualifiedOvertimeDeduction },
  ], [t])

  return (
    <Table className='Layer__TaxTable' aria-label={t('taxEstimates:adjustedGrossIncome', 'Adjusted Gross Income')}>
      <TableHeader className='Layer__TaxTable__Header'>
        <Row>
          <Column isRowHeader>{t('common:description', 'Description')}</Column>
          <Column>{t('common:amount', 'Amount')}</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <TaxTableRow label={t('taxEstimates:businessIncome', 'Business Income')} value={income.businessRevenue} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates:w2Income', 'W-2 Income')} value={income.w2Income} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates:deductions', 'Deductions')} value={deductions.total} variant={TaxTableRowVariant.Standard} />
        {deductionRows.map(({ key, label, getAmount }) => (
          <TaxTableRow key={key} label={label} sign='-' value={getAmount(deductions)} variant={TaxTableRowVariant.Nested} />
        ))}
        <TaxTableRow label={t('taxEstimates:adjustedGrossIncome', 'Adjusted Gross Income')} value={totalAdjustedGrossIncome} variant={TaxTableRowVariant.Total} />
      </TableBody>
    </Table>
  )
}

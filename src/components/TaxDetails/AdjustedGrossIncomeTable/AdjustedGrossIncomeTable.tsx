import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type AdjustedGrossIncome, type Deductions } from '@schemas/taxEstimates/details'
import { Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { TaxTableGroup, TaxTableRow, TaxTableRowVariant } from '@components/TaxDetails/TaxTable/TaxTable'

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
    { key: 'businessExpenses', label: t('taxEstimates:label.deductible_expenses', 'Deductible Expenses'), getAmount: d => d.businessExpenses },
    { key: 'vehicleExpense', label: t('taxEstimates:label.deductible_mileage_expenses', 'Deductible Mileage Expenses'), getAmount: d => d.vehicleExpense?.amount ?? 0 },
    { key: 'homeOffice', label: t('taxEstimates:label.home_office_deduction', 'Home Office Deduction'), getAmount: d => d.homeOffice?.amount ?? 0 },
    { key: 'selfEmploymentTaxDeduction', label: t('taxEstimates:label.self_employment_deduction', 'Self-Employment Deduction'), getAmount: d => d.selfEmploymentTaxDeduction },
    { key: 'qualifiedTipDeduction', label: t('taxEstimates:label.qualified_tip_deduction', 'Qualified Tip Deduction'), getAmount: d => d.qualifiedTipDeduction },
    { key: 'qualifiedOvertimeDeduction', label: t('taxEstimates:label.qualified_overtime_deduction', 'Qualified Overtime Deduction'), getAmount: d => d.qualifiedOvertimeDeduction },
  ], [t])

  return (
    <Table className='Layer__TaxTable' aria-label={t('taxEstimates:label.adjusted_gross_income', 'Adjusted Gross Income')}>
      <TableHeader className='Layer__TaxTable__Header'>
        <Row>
          <Column isRowHeader>{t('common:label.description', 'Description')}</Column>
          <Column>{t('common:label.amount', 'Amount')}</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <TaxTableRow label={t('taxEstimates:label.business_income', 'Business Income')} value={income.businessRevenue} variant={TaxTableRowVariant.Standard} level={0} />
        <TaxTableRow label={t('taxEstimates:label.w2_income', 'W-2 Income')} value={income.w2Income} variant={TaxTableRowVariant.Standard} level={0} />
        <TaxTableGroup
          parent={{
            label: t('taxEstimates:label.deductions', 'Deductions'),
            value: deductions.preAdjustedGrossIncomeDeduction,
          }}
        >
          {deductionRows.map(({ key, label, getAmount }) => (
            <TaxTableRow key={key} label={label} sign='-' value={getAmount(deductions)} variant={TaxTableRowVariant.Nested} level={1} />
          ))}
          <TaxTableRow
            label={t('taxEstimates:label.total_deductions', 'Total Deductions')}
            value={deductions.preAdjustedGrossIncomeDeduction}
            variant={TaxTableRowVariant.SectionTotal}
            level={1}
          />
        </TaxTableGroup>
        <TaxTableRow label={t('taxEstimates:label.adjusted_gross_income', 'Adjusted Gross Income')} value={totalAdjustedGrossIncome} variant={TaxTableRowVariant.Total} level={0} />
      </TableBody>
    </Table>
  )
}

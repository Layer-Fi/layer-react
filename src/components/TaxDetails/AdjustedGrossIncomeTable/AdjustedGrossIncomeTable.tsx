import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type AdjustedGrossIncome, type Deductions } from '@schemas/taxEstimates/details'
import { Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { CalculationTableGroup as CalcGroup, CalculationTableRow as CalcRow } from '@components/CalculationTable/CalculationTable'

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
    <Table className='Layer__CalculationTable' aria-label={t('taxEstimates:label.adjusted_gross_income', 'Adjusted Gross Income')}>
      <TableHeader className='Layer__CalculationTable__Header'>
        <Row>
          <Column isRowHeader>{t('common:label.description', 'Description')}</Column>
          <Column>{t('common:label.amount', 'Amount')}</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <CalcRow label={t('taxEstimates:label.business_income', 'Business Income')} value={income.businessRevenue} variants={['standard']} />
        <CalcRow label={t('taxEstimates:label.w2_income', 'W-2 Income')} value={income.w2Income} variants={['standard']} />
        <CalcGroup
          parent={{
            label: t('taxEstimates:label.deductions', 'Deductions'),
            value: deductions.preAdjustedGrossIncomeDeduction,
          }}
        >
          {deductionRows.map(({ key, label, getAmount }) => (
            <CalcRow key={key} label={label} sign='-' value={getAmount(deductions)} variants={['nested']} level={1} />
          ))}
          <CalcRow
            label={t('taxEstimates:label.total_deductions', 'Total Deductions')}
            value={deductions.preAdjustedGrossIncomeDeduction}
            variants={['section-total', 'bold']}
            level={1}
          />
        </CalcGroup>
        <CalcRow label={t('taxEstimates:label.adjusted_gross_income', 'Adjusted Gross Income')} value={totalAdjustedGrossIncome} variants={['total', 'bold']} />
      </TableBody>
    </Table>
  )
}

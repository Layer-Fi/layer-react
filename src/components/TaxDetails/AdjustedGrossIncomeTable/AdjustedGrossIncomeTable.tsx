import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

import { type AdjustedGrossIncome, type Deductions } from '@schemas/taxEstimates/details'
import { Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { TaxTableRow, TaxTableRowVariant } from '@components/TaxDetails/TaxTable/TaxTable'

type DeductionRowConfig = {
  key: string
  label: string
  getAmount: (deductions: Deductions) => number
}

const deductionRows: DeductionRowConfig[] = [
  { key: 'businessExpenses', label: i18next.t('deductibleExpenses', 'Deductible Expenses'), getAmount: d => d.businessExpenses },
  { key: 'vehicleExpense', label: i18next.t('deductibleMileageExpenses', 'Deductible Mileage Expenses'), getAmount: d => d.vehicleExpense?.amount ?? 0 },
  { key: 'homeOffice', label: i18next.t('homeOfficeDeduction', 'Home Office Deduction'), getAmount: d => d.homeOffice?.amount ?? 0 },
  { key: 'selfEmploymentTaxDeduction', label: i18next.t('selfEmploymentDeduction', 'Self-Employment Deduction'), getAmount: d => d.selfEmploymentTaxDeduction },
  { key: 'qualifiedTipDeduction', label: i18next.t('qualifiedTipDeduction', 'Qualified Tip Deduction'), getAmount: d => d.qualifiedTipDeduction },
  { key: 'qualifiedOvertimeDeduction', label: i18next.t('qualifiedOvertimeDeduction', 'Qualified Overtime Deduction'), getAmount: d => d.qualifiedOvertimeDeduction },
]

type AdjustedGrossIncomeTableProps = {
  data: AdjustedGrossIncome
}

export const AdjustedGrossIncomeTable = ({ data }: AdjustedGrossIncomeTableProps) => {
  const { t } = useTranslation()
  const { income, deductions, totalAdjustedGrossIncome } = data

  return (
    <Table className='Layer__TaxTable' aria-label={t('adjustedGrossIncome', 'Adjusted Gross Income')}>
      <TableHeader className='Layer__TaxTable__Header'>
        <Row>
          <Column isRowHeader>{t('description', 'Description')}</Column>
          <Column>{t('amount', 'Amount')}</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <TaxTableRow label={t('businessIncome', 'Business Income')} value={income.businessRevenue} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('w2Income', 'W-2 Income')} value={income.w2Income} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('deductions', 'Deductions')} value={deductions.total} variant={TaxTableRowVariant.Standard} />
        {deductionRows.map(({ key, label, getAmount }) => (
          <TaxTableRow key={key} label={label} sign='-' value={getAmount(deductions)} variant={TaxTableRowVariant.Nested} />
        ))}
        <TaxTableRow label={t('adjustedGrossIncome', 'Adjusted Gross Income')} value={totalAdjustedGrossIncome} variant={TaxTableRowVariant.Total} />
      </TableBody>
    </Table>
  )
}

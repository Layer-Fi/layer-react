import { type AdjustedGrossIncome, type Deductions } from '@schemas/taxEstimates/details'
import { Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { TaxTableRow, TaxTableRowVariant } from '@components/TaxDetails/TaxTable/TaxTable'

type DeductionRowConfig = {
  key: string
  label: string
  getAmount: (deductions: Deductions) => number
}

const deductionRows: DeductionRowConfig[] = [
  { key: 'businessExpenses', label: 'Deductible Expenses', getAmount: d => d.businessExpenses },
  { key: 'vehicleExpense', label: 'Deductible Mileage Expenses', getAmount: d => d.vehicleExpense?.amount ?? 0 },
  { key: 'homeOffice', label: 'Home Office Deduction', getAmount: d => d.homeOffice?.amount ?? 0 },
  { key: 'selfEmploymentTaxDeduction', label: 'Self-Employment Deduction', getAmount: d => d.selfEmploymentTaxDeduction },
  { key: 'qualifiedTipDeduction', label: 'Qualified Tip Deduction', getAmount: d => d.qualifiedTipDeduction },
  { key: 'qualifiedOvertimeDeduction', label: 'Qualified Overtime Deduction', getAmount: d => d.qualifiedOvertimeDeduction },
]

type AdjustedGrossIncomeTableProps = {
  data: AdjustedGrossIncome
}

export const AdjustedGrossIncomeTable = ({ data }: AdjustedGrossIncomeTableProps) => {
  const { income, deductions, totalAdjustedGrossIncome } = data

  return (
    <Table className='Layer__TaxTable' aria-label='Adjusted Gross Income'>
      <TableHeader className='Layer__TaxTable__Header'>
        <Row>
          <Column isRowHeader>Description</Column>
          <Column>Amount</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <TaxTableRow label='Business Income' value={income.businessRevenue} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label='W-2 Income' value={income.w2Income} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label='Deductions' value={-deductions.total} variant={TaxTableRowVariant.Standard} />
        {deductionRows.map(({ key, label, getAmount }) => (
          <TaxTableRow key={key} label={`- ${label}`} value={-getAmount(deductions)} variant={TaxTableRowVariant.Nested} />
        ))}
        <TaxTableRow label='Adjusted Gross Income' value={totalAdjustedGrossIncome} variant={TaxTableRowVariant.Total} />
      </TableBody>
    </Table>
  )
}

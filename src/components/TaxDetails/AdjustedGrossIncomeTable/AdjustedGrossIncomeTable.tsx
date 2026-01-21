import { type AdjustedGrossIncome, type Deductions } from '@schemas/taxEstimates/details'
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './adjustedGrossIncomeTable.scss'

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
    <Table className='Layer__AdjustedGrossIncomeTable' aria-label='Adjusted Gross Income'>
      <TableHeader className='Layer__AdjustedGrossIncomeTable__Header'>
        <Row>
          <Column isRowHeader>Description</Column>
          <Column>Amount</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell><Span>Business Income</Span></Cell>
          <Cell><MoneySpan amount={income.businessRevenue} /></Cell>
        </Row>
        <Row>
          <Cell><Span>W-2 Income</Span></Cell>
          <Cell><MoneySpan amount={income.w2Income} /></Cell>
        </Row>
        <Row>
          <Cell><Span>Deductions</Span></Cell>
          <Cell><MoneySpan amount={-deductions.total} /></Cell>
        </Row>
        {deductionRows.map(({ key, label, getAmount }) => (
          <Row key={key} className='Layer__AdjustedGrossIncomeTable__DeductionsRow'>
            <Cell><Span>{`- ${label}`}</Span></Cell>
            <Cell><MoneySpan amount={-getAmount(deductions)} /></Cell>
          </Row>
        ))}
        <Row className='AdjustedGrossIncomeTable__TotalRow'>
          <Cell><Span weight='bold'>Adjusted Gross Income</Span></Cell>
          <Cell><MoneySpan weight='bold' amount={totalAdjustedGrossIncome} /></Cell>
        </Row>
      </TableBody>
    </Table>
  )
}

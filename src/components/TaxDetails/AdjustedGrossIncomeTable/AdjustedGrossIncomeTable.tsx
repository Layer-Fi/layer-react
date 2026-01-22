import { type AdjustedGrossIncome, type Deductions } from '@schemas/taxEstimates/details'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
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
  const { isMobile } = useSizeClass()

  const NestedRowStyle = isMobile ? 'Layer__UI__Table-Row--mobile' : 'Layer__AdjustedGrossIncomeTable__DeductionsRow'
  const RowStyle = isMobile ? 'Layer__UI__Table-Row--mobile' : 'Layer__UI__Table-Row'
  const TotalRowStyle = isMobile ? 'Layer__UI__Table-Row--mobile' : 'Layer__AdjustedGrossIncomeTable__TotalRow'

  return (
    <Table className='Layer__AdjustedGrossIncomeTable' aria-label='Adjusted Gross Income'>
      <TableHeader className='Layer__AdjustedGrossIncomeTable__Header'>
        <Row>
          <Column isRowHeader>Description</Column>
          <Column>Amount</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <Row className={RowStyle}>
          <Cell><Span>Business Income</Span></Cell>
          <Cell><MoneySpan amount={income.businessRevenue} /></Cell>
        </Row>
        <Row className={RowStyle}>
          <Cell><Span>W-2 Income</Span></Cell>
          <Cell><MoneySpan amount={income.w2Income} /></Cell>
        </Row>
        <Row className={RowStyle}>
          <Cell><Span>Deductions</Span></Cell>
          <Cell><MoneySpan amount={-deductions.total} /></Cell>
        </Row>
        {deductionRows.map(({ key, label, getAmount }) => (
          <Row key={key} className={NestedRowStyle}>
            <Cell><Span>{`- ${label}`}</Span></Cell>
            <Cell><MoneySpan amount={-getAmount(deductions)} /></Cell>
          </Row>
        ))}
        <Row className={TotalRowStyle}>
          <Cell><Span weight='bold'>Adjusted Gross Income</Span></Cell>
          <Cell><MoneySpan weight='bold' amount={totalAdjustedGrossIncome} /></Cell>
        </Row>
      </TableBody>
    </Table>
  )
}

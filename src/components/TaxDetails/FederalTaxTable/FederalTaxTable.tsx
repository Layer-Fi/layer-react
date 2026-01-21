import { type UsFederalTax } from '@schemas/taxEstimates/details'
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './federalTaxTable.scss'

type FederalTaxTableProps = {
  data: UsFederalTax
  adjustedGrossIncome: number
}

export const FederalTaxTable = ({ data, adjustedGrossIncome }: FederalTaxTableProps) => {
  const { federalIncomeTax, socialSecurityTax, medicareTax, medicareSurtax, totalFederalTax } = data

  return (
    <Table className='Layer__FederalTaxTable' aria-label='Federal Tax'>
      <TableHeader className='Layer__FederalTaxTable__Header'>
        <Row>
          <Column isRowHeader>Description</Column>
          <Column>Amount</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell><Span>Adjusted Gross Income</Span></Cell>
          <Cell><MoneySpan amount={adjustedGrossIncome} /></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable_NestedRow'>
          <Cell><Span>- Federal Deductions</Span></Cell>
          <Cell><MoneySpan amount={federalIncomeTax.federalDeductions} /></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable_NestedRow'>
          <Cell><Span>{`- Business Income Deduction (${federalIncomeTax.qbiEffectiveRate})`}</Span></Cell>
          <Cell><MoneySpan amount={federalIncomeTax.qualifiedBusinessIncomeDeduction} /></Cell>
        </Row>
        <Row>
          <Cell><Span>Taxable Income</Span></Cell>
          <Cell><MoneySpan amount={federalIncomeTax.taxableIncome} /></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable_NestedRow'>
          <Cell><Span>× Federal Tax Rate</Span></Cell>
          <Cell><Span>{federalIncomeTax.effectiveFederalTaxRate}</Span></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable__SectionTotal'>
          <Cell><Span weight='bold'>Federal Tax Estimate (Owed)</Span></Cell>
          <Cell><MoneySpan weight='bold' amount={federalIncomeTax.federalIncomeTaxOwed} /></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable__EmptyRow'>
          <Cell />
          <Cell />
        </Row>
        <Row>
          <Cell><Span>Taxable Social Security Income</Span></Cell>
          <Cell><MoneySpan amount={socialSecurityTax.socialSecurityIncome} /></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable_NestedRow'>
          <Cell><Span>× Social Security Tax Rate</Span></Cell>
          <Cell><Span>{socialSecurityTax.socialSecurityTaxRate}</Span></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable__SectionTotal'>
          <Cell><Span weight='bold'>Social Security Tax Estimate (Owed)</Span></Cell>
          <Cell><MoneySpan weight='bold' amount={socialSecurityTax.socialSecurityTaxOwed} /></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable__EmptyRow'>
          <Cell />
          <Cell />
        </Row>
        <Row>
          <Cell><Span>Taxable Medicare Income</Span></Cell>
          <Cell><MoneySpan amount={medicareTax.medicareIncome} /></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable_NestedRow'>
          <Cell><Span>× Medicare Tax Rate</Span></Cell>
          <Cell><Span>{medicareTax.medicareTaxRate}</Span></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable__SectionTotal'>
          <Cell><Span weight='bold'>Medicare Tax Estimate (Owed)</Span></Cell>
          <Cell><MoneySpan weight='bold' amount={medicareTax.medicareTaxOwed} /></Cell>
        </Row>
        {medicareSurtax && (
          <>
            <Row className='Layer__FederalTaxTable__EmptyRow'>
              <Cell />
              <Cell />
            </Row>
            <Row>
              <Cell><Span>Taxable Medicare Surtax Income</Span></Cell>
              <Cell><MoneySpan amount={medicareSurtax.medicareSurtaxIncome} /></Cell>
            </Row>
            <Row className='Layer__FederalTaxTable_NestedRow'>
              <Cell><Span>× Medicare Surtax Rate</Span></Cell>
              <Cell><Span>{medicareSurtax.medicareSurtaxRate}</Span></Cell>
            </Row>
            <Row className='Layer__FederalTaxTable__SectionTotal'>
              <Cell><Span weight='bold'>Medicare Surtax Estimate (Owed)</Span></Cell>
              <Cell><MoneySpan weight='bold' amount={medicareSurtax.medicareSurtaxOwed} /></Cell>
            </Row>
          </>
        )}
        <Row className='Layer__FederalTaxTable__EmptyRow'>
          <Cell />
          <Cell />
        </Row>
        <Row>
          <Cell><Span>Federal Tax Estimate (Owed)</Span></Cell>
          <Cell><MoneySpan amount={totalFederalTax.federalIncomeTaxOwed} /></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable_NestedRow'>
          <Cell><Span>+ Social Security Tax Estimate (Owed)</Span></Cell>
          <Cell><MoneySpan amount={totalFederalTax.socialSecurityTaxOwed} /></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable_NestedRow'>
          <Cell><Span>+ Medicare Tax Estimate (Owed)</Span></Cell>
          <Cell><MoneySpan amount={totalFederalTax.medicareTaxOwed} /></Cell>
        </Row>
        {medicareSurtax && (
          <Row className='Layer__FederalTaxTable_NestedRow'>
            <Cell><Span>+ Medicare Surtax Estimate (Owed)</Span></Cell>
            <Cell><MoneySpan amount={totalFederalTax.medicareSurtaxOwed} /></Cell>
          </Row>
        )}
        <Row className='Layer__FederalTaxTable_NestedRow'>
          <Cell><Span>- Amount Applied from Federal W-2 Withholding</Span></Cell>
          <Cell><MoneySpan amount={totalFederalTax.w2Withholdings} /></Cell>
        </Row>
        <Row className='Layer__FederalTaxTable__TotalRow'>
          <Cell><Span weight='bold'>Total Federal Tax Estimate</Span></Cell>
          <Cell><MoneySpan weight='bold' amount={totalFederalTax.totalFederalTaxOwed} /></Cell>
        </Row>
      </TableBody>
    </Table>
  )
}

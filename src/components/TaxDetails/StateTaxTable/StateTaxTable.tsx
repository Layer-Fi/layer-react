import React from 'react'

import { type StateAdditionalTax, type StateIncomeTax, type TotalStateTax, type UsStateTax } from '@schemas/taxEstimates/details'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './stateTaxTable.scss'

type StateTaxTableProps = {
  data: UsStateTax
}

export const StateTaxTable = ({ data }: StateTaxTableProps) => {
  const { stateIncomeTax, additionalTaxes, totalStateTax }: {
    stateIncomeTax: StateIncomeTax
    additionalTaxes: readonly StateAdditionalTax[]
    totalStateTax: TotalStateTax
  } = data
  const { isMobile } = useSizeClass()

  const NestedRowStyle = isMobile ? 'Layer__UI__Table-Row--mobile' : 'Layer__StateTaxTable_NestedRow'
  const RowStyle = isMobile ? 'Layer__UI__Table-Row--mobile' : 'Layer__UI__Table-Row'
  const SectionTotalStyle = isMobile ? 'Layer__UI__Table-Row--mobile' : 'Layer__StateTaxTable__SectionTotal'
  const TotalRowStyle = isMobile ? 'Layer__UI__Table-Row--mobile' : 'Layer__StateTaxTable__TotalRow'

  return (
    <Table className='Layer__StateTaxTable' aria-label='State Tax'>
      <TableHeader className='Layer__StateTaxTable__Header'>
        <Row>
          <Column isRowHeader>Description</Column>
          <Column>Amount</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <Row className={RowStyle}>
          <Cell><Span>State Adjusted Gross Income</Span></Cell>
          <Cell><MoneySpan amount={stateIncomeTax.stateAgi} /></Cell>
        </Row>
        <Row className={NestedRowStyle}>
          <Cell><Span>- State Deductions</Span></Cell>
          <Cell><MoneySpan amount={stateIncomeTax.stateDeductions} /></Cell>
        </Row>
        <Row className={RowStyle}>
          <Cell><Span>State Taxable Income</Span></Cell>
          <Cell><MoneySpan amount={stateIncomeTax.stateTaxableIncome} /></Cell>
        </Row>
        <Row className={NestedRowStyle}>
          <Cell><Span>× State Tax Rate</Span></Cell>
          <Cell><Span>{stateIncomeTax.effectiveStateTaxRate}</Span></Cell>
        </Row>
        <Row className={SectionTotalStyle}>
          <Cell><Span weight='bold'>State Income Tax Estimate (Owed)</Span></Cell>
          <Cell><MoneySpan weight='bold' amount={stateIncomeTax.stateIncomeTaxOwed} /></Cell>
        </Row>
        {additionalTaxes.length > 0 && (
          <>
            <Row className='Layer__StateTaxTable__EmptyRow'>
              <Cell />
              <Cell />
            </Row>
            {additionalTaxes.map((additionalTax, index) => (
              <React.Fragment key={additionalTax.taxName}>
                <Row className={RowStyle}>
                  <Cell>
                    <Span>{`Taxable Amount for ${additionalTax.taxName}`}</Span>
                  </Cell>
                  <Cell><MoneySpan amount={additionalTax.taxableAmount} /></Cell>
                </Row>
                <Row className={NestedRowStyle}>
                  <Cell><Span>{`× ${additionalTax.taxName} Rate`}</Span></Cell>
                  <Cell><Span>{additionalTax.taxRate}</Span></Cell>
                </Row>
                <Row className={SectionTotalStyle}>
                  <Cell><Span weight='bold'>{`${additionalTax.taxName} Estimate (Owed)`}</Span></Cell>
                  <Cell><MoneySpan weight='bold' amount={additionalTax.taxOwed} /></Cell>
                </Row>
                {index < additionalTaxes.length - 1 && (
                  <Row className='Layer__StateTaxTable__EmptyRow'>
                    <Cell />
                    <Cell />
                  </Row>
                )}
              </React.Fragment>
            ))}
          </>
        )}
        <Row className='Layer__StateTaxTable__EmptyRow'>
          <Cell />
          <Cell />
        </Row>
        <Row className={RowStyle}>
          <Cell><Span>State Income Tax Estimate (Owed)</Span></Cell>
          <Cell><MoneySpan amount={totalStateTax.stateIncomeTaxOwed} /></Cell>
        </Row>
        {additionalTaxes.length > 0 && (
          <Row className={NestedRowStyle}>
            <Cell><Span>+ Additional State Taxes Estimate (Owed)</Span></Cell>
            <Cell><MoneySpan amount={totalStateTax.additionalTaxesOwed} /></Cell>
          </Row>
        )}
        <Row className={NestedRowStyle}>
          <Cell><Span>- Amount Applied from State Withholding</Span></Cell>
          <Cell><MoneySpan amount={totalStateTax.stateWithholdings} /></Cell>
        </Row>
        <Row className={TotalRowStyle}>
          <Cell><Span weight='bold'>Total State Tax Estimate</Span></Cell>
          <Cell><MoneySpan weight='bold' amount={totalStateTax.totalStateTaxOwed} /></Cell>
        </Row>
      </TableBody>
    </Table>
  )
}

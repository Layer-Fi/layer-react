import React from 'react'

import { type UsStateTax } from '@schemas/taxEstimates/details'
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './stateTaxTable.scss'

type StateTaxTableProps = {
  data: UsStateTax
}

export const StateTaxTable = ({ data }: StateTaxTableProps) => {
  const { stateIncomeTax, additionalTaxes, totalStateTax } = data

  return (
    <Table className='Layer__StateTaxTable' aria-label='State Tax'>
      <TableHeader className='Layer__StateTaxTable__Header'>
        <Row>
          <Column isRowHeader>Description</Column>
          <Column>Amount</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell><Span>State Adjusted Gross Income</Span></Cell>
          <Cell><MoneySpan amount={stateIncomeTax.stateAgi} /></Cell>
        </Row>
        <Row>
          <Cell><Span>- State Deductions</Span></Cell>
          <Cell><MoneySpan amount={stateIncomeTax.stateDeductions} /></Cell>
        </Row>
        <Row>
          <Cell><Span>= State Taxable Income</Span></Cell>
          <Cell><MoneySpan amount={stateIncomeTax.stateTaxableIncome} /></Cell>
        </Row>
        <Row>
          <Cell><Span>x State Tax Rate</Span></Cell>
          <Cell><Span>{stateIncomeTax.effectiveStateTaxRate}</Span></Cell>
        </Row>
        <Row className='Layer__StateTaxTable__SectionTotal'>
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
              <React.Fragment key={index}>
                <Row>
                  <Cell><Span>Taxable Amount for {additionalTax.taxName}</Span></Cell>
                  <Cell><MoneySpan amount={additionalTax.taxableAmount} /></Cell>
                </Row>
                <Row>
                  <Cell><Span>{`x ${additionalTax.taxName} Rate`}</Span></Cell>
                  <Cell><Span>{additionalTax.taxRate}</Span></Cell>
                </Row>
                <Row className='Layer__StateTaxTable__SectionTotal'>
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
        <Row>
          <Cell><Span>State Income Tax Estimate (Owed)</Span></Cell>
          <Cell><MoneySpan amount={totalStateTax.stateIncomeTaxOwed} /></Cell>
        </Row>
        {additionalTaxes.length > 0 && (
          <Row>
            <Cell><Span>+ Additional State Taxes Estimate (Owed)</Span></Cell>
            <Cell><MoneySpan amount={totalStateTax.additionalTaxesOwed} /></Cell>
          </Row>
        )}
        <Row>
          <Cell><Span>- Amount Applied from State Withholding</Span></Cell>
          <Cell><MoneySpan amount={totalStateTax.stateWithholdings} /></Cell>
        </Row>
        <Row className='Layer__StateTaxTable__TotalRow'>
          <Cell><Span weight='bold'>Total State Tax Estimate</Span></Cell>
          <Cell><MoneySpan weight='bold' amount={totalStateTax.totalStateTaxOwed} /></Cell>
        </Row>
      </TableBody>
    </Table>
  )
}

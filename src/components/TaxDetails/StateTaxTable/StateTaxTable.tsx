import React from 'react'

import { type StateAdditionalTax, type StateIncomeTax, type TotalStateTax, type UsStateTax } from '@schemas/taxEstimates/details'
import { Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { TaxTableRow, TaxTableRowVariant } from '@components/TaxDetails/TaxTable/TaxTable'

type StateTaxTableProps = {
  data: UsStateTax
}

export const StateTaxTable = ({ data }: StateTaxTableProps) => {
  const { stateIncomeTax, additionalTaxes, totalStateTax }: {
    stateIncomeTax: StateIncomeTax
    additionalTaxes: readonly StateAdditionalTax[]
    totalStateTax: TotalStateTax
  } = data

  return (
    <Table className='Layer__TaxTable' aria-label='State Tax'>
      <TableHeader className='Layer__TaxTable__Header'>
        <Row>
          <Column isRowHeader>Description</Column>
          <Column>Amount</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <TaxTableRow label='State Adjusted Gross Income' value={stateIncomeTax.stateAgi} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label='- State Deductions' value={stateIncomeTax.stateDeductions} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label='State Taxable Income' value={stateIncomeTax.stateTaxableIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label='× State Tax Rate' value={stateIncomeTax.effectiveStateTaxRate} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label='State Income Tax Estimate (Owed)' value={stateIncomeTax.stateIncomeTaxOwed} variant={TaxTableRowVariant.SectionTotal} />
        {additionalTaxes.length > 0 && (
          <>
            <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
            {additionalTaxes.map((additionalTax, index) => (
              <React.Fragment key={additionalTax.taxName}>
                <TaxTableRow label={`Taxable Amount for ${additionalTax.taxName}`} value={additionalTax.taxableAmount} variant={TaxTableRowVariant.Standard} />
                <TaxTableRow label={`× ${additionalTax.taxName} Rate`} value={additionalTax.taxRate} variant={TaxTableRowVariant.Nested} />
                <TaxTableRow label={`${additionalTax.taxName} Estimate (Owed)`} value={additionalTax.taxOwed} variant={TaxTableRowVariant.SectionTotal} />
                {index < additionalTaxes.length - 1 && (
                  <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
                )}
              </React.Fragment>
            ))}
          </>
        )}
        <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
        <TaxTableRow label='State Income Tax Estimate (Owed)' value={totalStateTax.stateIncomeTaxOwed} variant={TaxTableRowVariant.Standard} />
        {additionalTaxes.length > 0 && (
          <TaxTableRow label='+ Additional State Taxes Estimate (Owed)' value={totalStateTax.additionalTaxesOwed} variant={TaxTableRowVariant.Nested} />
        )}
        <TaxTableRow label='- Amount Applied from State Withholding' value={totalStateTax.stateWithholdings} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label='Total State Tax Estimate' value={totalStateTax.totalStateTaxOwed} variant={TaxTableRowVariant.Total} />
      </TableBody>
    </Table>
  )
}

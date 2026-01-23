import { type UsFederalTax } from '@schemas/taxEstimates/details'
import { Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { TaxTableRow, TaxTableRowVariant } from '@components/TaxDetails/TaxTable/TaxTable'

type FederalTaxTableProps = {
  data: UsFederalTax
  adjustedGrossIncome: number
}

export const FederalTaxTable = ({ data, adjustedGrossIncome }: FederalTaxTableProps) => {
  const { federalIncomeTax, socialSecurityTax, medicareTax, medicareSurtax, totalFederalTax } = data

  return (
    <Table className='Layer__TaxTable' aria-label='Federal Tax'>
      <TableHeader className='Layer__TaxTable__Header'>
        <Row>
          <Column isRowHeader>Description</Column>
          <Column>Amount</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <TaxTableRow label='Adjusted Gross Income' value={adjustedGrossIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label='- Federal Deductions' value={federalIncomeTax.federalDeductions} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={`- Business Income Deduction (${federalIncomeTax.qbiEffectiveRate})`} value={federalIncomeTax.qualifiedBusinessIncomeDeduction} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label='Taxable Income' value={federalIncomeTax.taxableIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label='× Federal Tax Rate' value={federalIncomeTax.effectiveFederalTaxRate} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label='Federal Tax Estimate (Owed)' value={federalIncomeTax.federalIncomeTaxOwed} variant={TaxTableRowVariant.SectionTotal} />
        <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
        <TaxTableRow label='Taxable Social Security Income' value={socialSecurityTax.socialSecurityIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label='× Social Security Tax Rate' value={socialSecurityTax.socialSecurityTaxRate} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label='Social Security Tax Estimate (Owed)' value={socialSecurityTax.socialSecurityTaxOwed} variant={TaxTableRowVariant.SectionTotal} />
        <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
        <TaxTableRow label='Taxable Medicare Income' value={medicareTax.medicareIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label='× Medicare Tax Rate' value={medicareTax.medicareTaxRate} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label='Medicare Tax Estimate (Owed)' value={medicareTax.medicareTaxOwed} variant={TaxTableRowVariant.SectionTotal} />
        {medicareSurtax && (
          <>
            <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
            <TaxTableRow label='Taxable Medicare Surtax Income' value={medicareSurtax.medicareSurtaxIncome} variant={TaxTableRowVariant.Standard} />
            <TaxTableRow label='× Medicare Surtax Rate' value={medicareSurtax.medicareSurtaxRate} variant={TaxTableRowVariant.Nested} />
            <TaxTableRow label='Medicare Surtax Estimate (Owed)' value={medicareSurtax.medicareSurtaxOwed} variant={TaxTableRowVariant.SectionTotal} />
          </>
        )}
        <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
        <TaxTableRow label='Federal Tax Estimate (Owed)' value={totalFederalTax.federalIncomeTaxOwed} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label='+ Social Security Tax Estimate (Owed)' value={totalFederalTax.socialSecurityTaxOwed} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label='+ Medicare Tax Estimate (Owed)' value={totalFederalTax.medicareTaxOwed} variant={TaxTableRowVariant.Nested} />
        {medicareSurtax && (
          <TaxTableRow label='+ Medicare Surtax Estimate (Owed)' value={totalFederalTax.medicareSurtaxOwed} variant={TaxTableRowVariant.Nested} />
        )}
        <TaxTableRow label='- Amount Applied from Federal W-2 Withholding' value={totalFederalTax.w2Withholdings} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label='Total Federal Tax Estimate' value={totalFederalTax.totalFederalTaxOwed} variant={TaxTableRowVariant.Total} />
      </TableBody>
    </Table>
  )
}

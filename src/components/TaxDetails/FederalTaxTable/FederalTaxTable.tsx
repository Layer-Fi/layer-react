import { useTranslation } from 'react-i18next'

import { type UsFederalTax } from '@schemas/taxEstimates/details'
import { Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { TaxTableRow, TaxTableRowVariant } from '@components/TaxDetails/TaxTable/TaxTable'

type FederalTaxTableProps = {
  data: UsFederalTax
  adjustedGrossIncome: number
}

export const FederalTaxTable = ({ data, adjustedGrossIncome }: FederalTaxTableProps) => {
  const { t } = useTranslation()
  const { federalIncomeTax, socialSecurityTax, medicareTax, medicareSurtax, totalFederalTax } = data

  return (
    <Table className='Layer__TaxTable' aria-label={t('taxEstimates:label.federal_tax', 'Federal Tax')}>
      <TableHeader className='Layer__TaxTable__Header'>
        <Row>
          <Column isRowHeader>{t('common:label.description', 'Description')}</Column>
          <Column>{t('common:label.amount', 'Amount')}</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <TaxTableRow label={t('taxEstimates:label.adjusted_gross_income', 'Adjusted Gross Income')} value={adjustedGrossIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates:label.federal_deductions', 'Federal Deductions')} sign='-' value={federalIncomeTax.federalDeductions} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow
          label={t('taxEstimates:label.business_income_deduction_rate', 'Business Income Deduction ({{rate}})', { rate: federalIncomeTax.qbiEffectiveRate })}
          sign='-'
          value={federalIncomeTax.qualifiedBusinessIncomeDeduction}
          variant={TaxTableRowVariant.Nested}
        />
        <TaxTableRow label={t('taxEstimates:label.taxable_income', 'Taxable Income')} value={federalIncomeTax.taxableIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates:label.federal_tax_rate', 'Federal Tax Rate')} sign='×' value={federalIncomeTax.effectiveFederalTaxRate} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates:label.federal_tax_estimate_owed', 'Federal Tax Estimate (Owed)')} value={federalIncomeTax.federalIncomeTaxOwed} variant={TaxTableRowVariant.SectionTotal} />
        <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
        <TaxTableRow label={t('taxEstimates:label.taxable_social_security_income', 'Taxable Social Security Income')} value={socialSecurityTax.socialSecurityIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates:label.social_security_tax_rate', 'Social Security Tax Rate')} sign='×' value={socialSecurityTax.socialSecurityTaxRate} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates:label.social_security_tax_estimate_owed', 'Social Security Tax Estimate (Owed)')} value={socialSecurityTax.socialSecurityTaxOwed} variant={TaxTableRowVariant.SectionTotal} />
        <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
        <TaxTableRow label={t('taxEstimates:label.taxable_medicare_income', 'Taxable Medicare Income')} value={medicareTax.medicareIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates:label.medicare_tax_rate', 'Medicare Tax Rate')} sign='×' value={medicareTax.medicareTaxRate} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates:label.medicare_tax_estimate_owed', 'Medicare Tax Estimate (Owed)')} value={medicareTax.medicareTaxOwed} variant={TaxTableRowVariant.SectionTotal} />
        {medicareSurtax && (
          <>
            <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
            <TaxTableRow label={t('taxEstimates:label.taxable_medicare_surtax_income', 'Taxable Medicare Surtax Income')} value={medicareSurtax.medicareSurtaxIncome} variant={TaxTableRowVariant.Standard} />
            <TaxTableRow label={t('taxEstimates:label.medicare_surtax_rate', 'Medicare Surtax Rate')} sign='×' value={medicareSurtax.medicareSurtaxRate} variant={TaxTableRowVariant.Nested} />
            <TaxTableRow label={t('taxEstimates:label.medicare_surtax_estimate_owed', 'Medicare Surtax Estimate (Owed)')} value={medicareSurtax.medicareSurtaxOwed} variant={TaxTableRowVariant.SectionTotal} />
          </>
        )}
        <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
        <TaxTableRow label={t('taxEstimates:label.federal_tax_estimate_owed', 'Federal Tax Estimate (Owed)')} value={totalFederalTax.federalIncomeTaxOwed} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates:label.social_security_tax_estimate_owed', 'Social Security Tax Estimate (Owed)')} sign='+' value={totalFederalTax.socialSecurityTaxOwed} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates:label.medicare_tax_estimate_owed', 'Medicare Tax Estimate (Owed)')} sign='+' value={totalFederalTax.medicareTaxOwed} variant={TaxTableRowVariant.Nested} />
        {medicareSurtax && (
          <TaxTableRow label={t('taxEstimates:label.medicare_surtax_estimate_owed', 'Medicare Surtax Estimate (Owed)')} sign='+' value={totalFederalTax.medicareSurtaxOwed} variant={TaxTableRowVariant.Nested} />
        )}
        <TaxTableRow label={t('taxEstimates:label.amount_applied_federal_w2', 'Amount Applied from Federal W-2 Withholding')} sign='-' value={totalFederalTax.w2Withholdings} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates:label.total_federal_tax_estimate', 'Total Federal Tax Estimate')} value={totalFederalTax.totalFederalTaxOwed} variant={TaxTableRowVariant.Total} />
      </TableBody>
    </Table>
  )
}

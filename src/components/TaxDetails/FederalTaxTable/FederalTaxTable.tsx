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
    <Table className='Layer__TaxTable' aria-label={t('taxEstimates.federalTax', 'Federal Tax')}>
      <TableHeader className='Layer__TaxTable__Header'>
        <Row>
          <Column isRowHeader>{t('common.description', 'Description')}</Column>
          <Column>{t('common.amount', 'Amount')}</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <TaxTableRow label={t('taxEstimates.adjustedGrossIncome', 'Adjusted Gross Income')} value={adjustedGrossIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates.federalDeductions', 'Federal Deductions')} sign='-' value={federalIncomeTax.federalDeductions} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow
          label={t('taxEstimates.businessIncomeDeductionRate', 'Business Income Deduction ({{rate}})', { rate: federalIncomeTax.qbiEffectiveRate })}
          sign='-'
          value={federalIncomeTax.qualifiedBusinessIncomeDeduction}
          variant={TaxTableRowVariant.Nested}
        />
        <TaxTableRow label={t('taxEstimates.taxableIncome', 'Taxable Income')} value={federalIncomeTax.taxableIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates.federalTaxRate', 'Federal Tax Rate')} sign='×' value={federalIncomeTax.effectiveFederalTaxRate} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates.federalTaxEstimateOwed', 'Federal Tax Estimate (Owed)')} value={federalIncomeTax.federalIncomeTaxOwed} variant={TaxTableRowVariant.SectionTotal} />
        <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
        <TaxTableRow label={t('taxEstimates.taxableSocialSecurityIncome', 'Taxable Social Security Income')} value={socialSecurityTax.socialSecurityIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates.socialSecurityTaxRate', 'Social Security Tax Rate')} sign='×' value={socialSecurityTax.socialSecurityTaxRate} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates.socialSecurityTaxEstimateOwed', 'Social Security Tax Estimate (Owed)')} value={socialSecurityTax.socialSecurityTaxOwed} variant={TaxTableRowVariant.SectionTotal} />
        <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
        <TaxTableRow label={t('taxEstimates.taxableMedicareIncome', 'Taxable Medicare Income')} value={medicareTax.medicareIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates.medicareTaxRate', 'Medicare Tax Rate')} sign='×' value={medicareTax.medicareTaxRate} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates.medicareTaxEstimateOwed', 'Medicare Tax Estimate (Owed)')} value={medicareTax.medicareTaxOwed} variant={TaxTableRowVariant.SectionTotal} />
        {medicareSurtax && (
          <>
            <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
            <TaxTableRow label={t('taxEstimates.taxableMedicareSurtaxIncome', 'Taxable Medicare Surtax Income')} value={medicareSurtax.medicareSurtaxIncome} variant={TaxTableRowVariant.Standard} />
            <TaxTableRow label={t('taxEstimates.medicareSurtaxRate', 'Medicare Surtax Rate')} sign='×' value={medicareSurtax.medicareSurtaxRate} variant={TaxTableRowVariant.Nested} />
            <TaxTableRow label={t('taxEstimates.medicareSurtaxEstimateOwed', 'Medicare Surtax Estimate (Owed)')} value={medicareSurtax.medicareSurtaxOwed} variant={TaxTableRowVariant.SectionTotal} />
          </>
        )}
        <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
        <TaxTableRow label={t('taxEstimates.federalTaxEstimateOwed', 'Federal Tax Estimate (Owed)')} value={totalFederalTax.federalIncomeTaxOwed} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates.socialSecurityTaxEstimateOwedPrefixed', 'Social Security Tax Estimate (Owed)')} sign='+' value={totalFederalTax.socialSecurityTaxOwed} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates.medicareTaxEstimateOwedPrefixed', 'Medicare Tax Estimate (Owed)')} sign='+' value={totalFederalTax.medicareTaxOwed} variant={TaxTableRowVariant.Nested} />
        {medicareSurtax && (
          <TaxTableRow label={t('taxEstimates.medicareSurtaxEstimateOwedPrefixed', 'Medicare Surtax Estimate (Owed)')} sign='+' value={totalFederalTax.medicareSurtaxOwed} variant={TaxTableRowVariant.Nested} />
        )}
        <TaxTableRow label={t('taxEstimates.amountAppliedFromFederalW2Withholding', 'Amount Applied from Federal W-2 Withholding')} sign='-' value={totalFederalTax.w2Withholdings} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates.totalFederalTaxEstimate', 'Total Federal Tax Estimate')} value={totalFederalTax.totalFederalTaxOwed} variant={TaxTableRowVariant.Total} />
      </TableBody>
    </Table>
  )
}

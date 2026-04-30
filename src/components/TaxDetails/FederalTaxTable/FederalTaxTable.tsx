import { useTranslation } from 'react-i18next'

import { type UsFederalTax } from '@schemas/taxEstimates/details'
import { Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { CalculationTableGroup as CalcGroup, CalculationTableRow as CalcRow } from '@components/CalculationTable/CalculationTable'

type FederalTaxTableProps = {
  data: UsFederalTax
  adjustedGrossIncome: number
}

export const FederalTaxTable = ({ data, adjustedGrossIncome }: FederalTaxTableProps) => {
  const { t } = useTranslation()
  const { federalIncomeTax, socialSecurityTax, medicareTax, medicareSurtax, totalFederalTax } = data

  return (
    <Table className='Layer__CalculationTable' aria-label={t('taxEstimates:label.federal_tax', 'Federal Tax')}>
      <TableHeader className='Layer__CalculationTable__Header'>
        <Row>
          <Column isRowHeader>{t('common:label.description', 'Description')}</Column>
          <Column>{t('common:label.amount', 'Amount')}</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <CalcGroup
          parent={{
            label: t('taxEstimates:label.adjusted_gross_income', 'Adjusted Gross Income'),
            value: adjustedGrossIncome,
          }}
        >
          <CalcRow label={t('taxEstimates:label.federal_deductions', 'Federal Deductions')} sign='-' value={federalIncomeTax.federalDeductions} variants={['nested']} level={1} />
          <CalcRow
            label={t('taxEstimates:label.business_income_deduction_rate', 'Business Income Deduction ({{rate}})', { rate: federalIncomeTax.qbiEffectiveRate })}
            sign='-'
            value={federalIncomeTax.qualifiedBusinessIncomeDeduction}
            variants={['nested']}
            level={1}
          />
          <CalcRow label={t('taxEstimates:label.taxable_income', 'Taxable Income')} sign='=' value={federalIncomeTax.taxableIncome} variants={['nested']} level={1} />
          <CalcRow label={t('taxEstimates:label.federal_tax_rate', 'Federal Tax Rate')} sign='×' value={federalIncomeTax.effectiveFederalTaxRate} variants={['nested']} level={1} />
          <CalcRow label={t('taxEstimates:label.federal_tax_estimate_owed', 'Federal Tax Estimate (Owed)')} value={federalIncomeTax.federalIncomeTaxOwed} variants={['section-total', 'bold']} level={1} />
        </CalcGroup>
        <CalcGroup
          parent={{
            label: t('taxEstimates:label.taxable_social_security_income', 'Taxable Social Security Income'),
            value: socialSecurityTax.socialSecurityIncome,
          }}
        >
          <CalcRow label={t('taxEstimates:label.social_security_tax_rate', 'Social Security Tax Rate')} sign='×' value={socialSecurityTax.socialSecurityTaxRate} variants={['nested']} level={1} />
          <CalcRow label={t('taxEstimates:label.social_security_tax_estimate_owed', 'Social Security Tax Estimate (Owed)')} value={socialSecurityTax.socialSecurityTaxOwed} variants={['section-total', 'bold']} level={1} />
        </CalcGroup>
        <CalcGroup
          parent={{
            label: t('taxEstimates:label.taxable_medicare_income', 'Taxable Medicare Income'),
            value: medicareTax.medicareIncome,
          }}
        >
          <CalcRow label={t('taxEstimates:label.medicare_tax_rate', 'Medicare Tax Rate')} sign='×' value={medicareTax.medicareTaxRate} variants={['nested']} level={1} />
          <CalcRow label={t('taxEstimates:label.medicare_tax_estimate_owed', 'Medicare Tax Estimate (Owed)')} value={medicareTax.medicareTaxOwed} variants={['section-total', 'bold']} level={1} />
        </CalcGroup>
        {medicareSurtax && (
          <CalcGroup
            parent={{
              label: t('taxEstimates:label.taxable_medicare_surtax_income', 'Taxable Medicare Surtax Income'),
              value: medicareSurtax.medicareSurtaxIncome,
            }}
          >
            <CalcRow label={t('taxEstimates:label.medicare_surtax_rate', 'Medicare Surtax Rate')} sign='×' value={medicareSurtax.medicareSurtaxRate} variants={['nested']} level={1} />
            <CalcRow label={t('taxEstimates:label.medicare_surtax_estimate_owed', 'Medicare Surtax Estimate (Owed)')} value={medicareSurtax.medicareSurtaxOwed} variants={['section-total', 'bold']} level={1} />
          </CalcGroup>
        )}
        <CalcRow label={t('taxEstimates:label.federal_tax_estimate_owed', 'Federal Tax Estimate (Owed)')} value={totalFederalTax.federalIncomeTaxOwed} variants={['standard']} />
        <CalcRow label={t('taxEstimates:label.social_security_tax_estimate_owed', 'Social Security Tax Estimate (Owed)')} sign='+' value={totalFederalTax.socialSecurityTaxOwed} variants={['nested']} level={1} />
        <CalcRow label={t('taxEstimates:label.medicare_tax_estimate_owed', 'Medicare Tax Estimate (Owed)')} sign='+' value={totalFederalTax.medicareTaxOwed} variants={['nested']} level={1} />
        {medicareSurtax && (
          <CalcRow label={t('taxEstimates:label.medicare_surtax_estimate_owed', 'Medicare Surtax Estimate (Owed)')} sign='+' value={totalFederalTax.medicareSurtaxOwed} variants={['nested']} level={1} />
        )}
        <CalcRow label={t('taxEstimates:label.amount_applied_federal_w2', 'Amount Applied from Federal W-2 Withholding')} sign='-' value={totalFederalTax.w2Withholdings} variants={['nested']} level={1} />
        <CalcRow label={t('taxEstimates:label.total_federal_tax_estimate', 'Total Federal Tax Estimate')} value={totalFederalTax.totalFederalTaxOwed} variants={['total', 'bold']} />
      </TableBody>
    </Table>
  )
}

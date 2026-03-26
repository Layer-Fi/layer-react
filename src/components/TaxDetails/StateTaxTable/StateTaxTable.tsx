import React from 'react'
import { useTranslation } from 'react-i18next'

import { type StateAdditionalTax, type StateIncomeTax, type TotalStateTax, type UsStateTax } from '@schemas/taxEstimates/details'
import { Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { TaxTableRow, TaxTableRowVariant } from '@components/TaxDetails/TaxTable/TaxTable'

type StateTaxTableProps = {
  data: UsStateTax
}

export const StateTaxTable = ({ data }: StateTaxTableProps) => {
  const { t } = useTranslation()
  const { stateIncomeTax, additionalTaxes, totalStateTax }: {
    stateIncomeTax: StateIncomeTax
    additionalTaxes: readonly StateAdditionalTax[]
    totalStateTax: TotalStateTax
  } = data

  return (
    <Table className='Layer__TaxTable' aria-label={t('taxEstimates:label.state_tax', 'State Tax')}>
      <TableHeader className='Layer__TaxTable__Header'>
        <Row>
          <Column isRowHeader>{t('common:label.description', 'Description')}</Column>
          <Column>{t('common:label.amount', 'Amount')}</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <TaxTableRow label={t('taxEstimates:label.state_adjusted_gross_income', 'State Adjusted Gross Income')} value={stateIncomeTax.stateAgi} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates:label.state_deductions', 'State Deductions')} sign='-' value={stateIncomeTax.stateDeductions} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates:label.state_taxable_income', 'State Taxable Income')} value={stateIncomeTax.stateTaxableIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('taxEstimates:label.state_tax_rate', 'State Tax Rate')} sign='×' value={stateIncomeTax.effectiveStateTaxRate} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates:label.state_income_tax_estimate_owed', 'State Income Tax Estimate (Owed)')} value={stateIncomeTax.stateIncomeTaxOwed} variant={TaxTableRowVariant.SectionTotal} />
        {additionalTaxes.map((additionalTax) => (
          <React.Fragment key={additionalTax.taxName}>
            <TaxTableRow label={t('taxEstimates:label.taxable_amount_tax_name', 'Taxable Amount for {{taxName}}', { taxName: additionalTax.taxName })} value={additionalTax.taxableAmount} variant={TaxTableRowVariant.Standard} />
            <TaxTableRow label={t('taxEstimates:label.tax_name_rate', '{{taxName}} Rate', { taxName: additionalTax.taxName })} sign='×' value={additionalTax.taxRate} variant={TaxTableRowVariant.Nested} />
            <TaxTableRow label={t('taxEstimates:label.tax_name_estimate_owed', '{{taxName}} Estimate (Owed)', { taxName: additionalTax.taxName })} value={additionalTax.taxOwed} variant={TaxTableRowVariant.SectionTotal} />
          </React.Fragment>
        ))}
        <TaxTableRow label={t('taxEstimates:label.state_income_tax_estimate_owed', 'State Income Tax Estimate (Owed)')} value={totalStateTax.stateIncomeTaxOwed} variant={TaxTableRowVariant.Standard} />
        {additionalTaxes.length > 0 && (
          <TaxTableRow label={t('taxEstimates:label.additional_state_taxes_estimate_owed', 'Additional State Taxes Estimate (Owed)')} sign='+' value={totalStateTax.additionalTaxesOwed} variant={TaxTableRowVariant.Nested} />
        )}
        <TaxTableRow label={t('taxEstimates:label.amount_applied_state_withholding', 'Amount Applied from State Withholding')} sign='-' value={totalStateTax.stateWithholdings} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('taxEstimates:label.total_state_tax_estimate', 'Total State Tax Estimate')} value={totalStateTax.totalStateTaxOwed} variant={TaxTableRowVariant.Total} />
      </TableBody>
    </Table>
  )
}

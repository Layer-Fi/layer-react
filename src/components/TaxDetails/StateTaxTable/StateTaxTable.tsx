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
    <Table className='Layer__TaxTable' aria-label={t('stateTax', 'State Tax')}>
      <TableHeader className='Layer__TaxTable__Header'>
        <Row>
          <Column isRowHeader>{t('description', 'Description')}</Column>
          <Column>{t('amount', 'Amount')}</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <TaxTableRow label={t('stateAdjustedGrossIncome', 'State Adjusted Gross Income')} value={stateIncomeTax.stateAgi} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('stateDeductions', 'State Deductions')} sign='-' value={stateIncomeTax.stateDeductions} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('stateTaxableIncome', 'State Taxable Income')} value={stateIncomeTax.stateTaxableIncome} variant={TaxTableRowVariant.Standard} />
        <TaxTableRow label={t('stateTaxRate', 'State Tax Rate')} sign='×' value={stateIncomeTax.effectiveStateTaxRate} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('stateIncomeTaxEstimateOwed', 'State Income Tax Estimate (Owed)')} value={stateIncomeTax.stateIncomeTaxOwed} variant={TaxTableRowVariant.SectionTotal} />
        {additionalTaxes.length > 0 && (
          <>
            <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
            {additionalTaxes.map((additionalTax, index) => (
              <React.Fragment key={additionalTax.taxName}>
                <TaxTableRow label={t('taxableAmountForTaxname', 'Taxable Amount for {{taxName}}', { taxName: additionalTax.taxName })} value={additionalTax.taxableAmount} variant={TaxTableRowVariant.Standard} />
                <TaxTableRow label={t('taxNameRate', '{{taxName}} Rate', { taxName: additionalTax.taxName })} sign='×' value={additionalTax.taxRate} variant={TaxTableRowVariant.Nested} />
                <TaxTableRow label={t('taxNameEstimateOwed', '{{taxName}} Estimate (Owed)', { taxName: additionalTax.taxName })} value={additionalTax.taxOwed} variant={TaxTableRowVariant.SectionTotal} />
                {index < additionalTaxes.length - 1 && (
                  <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
                )}
              </React.Fragment>
            ))}
          </>
        )}
        <TaxTableRow label='' value='' variant={TaxTableRowVariant.Empty} />
        <TaxTableRow label={t('stateIncomeTaxEstimateOwed', 'State Income Tax Estimate (Owed)')} value={totalStateTax.stateIncomeTaxOwed} variant={TaxTableRowVariant.Standard} />
        {additionalTaxes.length > 0 && (
          <TaxTableRow label={t('additionalStateTaxesEstimateOwed', 'Additional State Taxes Estimate (Owed)')} sign='+' value={totalStateTax.additionalTaxesOwed} variant={TaxTableRowVariant.Nested} />
        )}
        <TaxTableRow label={t('amountAppliedFromStateWithholding', 'Amount Applied from State Withholding')} sign='-' value={totalStateTax.stateWithholdings} variant={TaxTableRowVariant.Nested} />
        <TaxTableRow label={t('totalStateTaxEstimate', 'Total State Tax Estimate')} value={totalStateTax.totalStateTaxOwed} variant={TaxTableRowVariant.Total} />
      </TableBody>
    </Table>
  )
}

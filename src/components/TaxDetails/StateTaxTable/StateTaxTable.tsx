import React from 'react'
import { useTranslation } from 'react-i18next'

import { type StateAdditionalTax, type StateIncomeTax, type TotalStateTax, type UsStateTax } from '@schemas/taxEstimates/details'
import { Column, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { CalculationTableGroup as CalcGroup, CalculationTableRow as CalcRow } from '@components/CalculationTable/CalculationTable'

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
    <Table className='Layer__CalculationTable' aria-label={t('taxEstimates:label.state_tax', 'State Tax')}>
      <TableHeader className='Layer__CalculationTable__Header'>
        <Row>
          <Column isRowHeader>{t('common:label.description', 'Description')}</Column>
          <Column>{t('common:label.amount', 'Amount')}</Column>
        </Row>
      </TableHeader>
      <TableBody>
        <CalcGroup
          parent={{
            label: t('taxEstimates:label.state_adjusted_gross_income', 'State Adjusted Gross Income'),
            value: stateIncomeTax.stateAgi,
          }}
        >
          <CalcRow label={t('taxEstimates:label.state_deductions', 'State Deductions')} sign='-' value={stateIncomeTax.stateDeductions} variants={['nested', 'indented']} level={1} />
          <CalcRow label={t('taxEstimates:label.state_taxable_income', 'State Taxable Income')} sign='=' value={stateIncomeTax.stateTaxableIncome} variants={['nested', 'indented']} level={1} />
          <CalcRow label={t('taxEstimates:label.state_tax_rate', 'State Tax Rate')} sign='×' value={stateIncomeTax.effectiveStateTaxRate} variants={['nested', 'indented']} level={1} />
          <CalcRow label={t('taxEstimates:label.state_income_tax_estimate_owed', 'State Income Tax Estimate (Owed)')} value={stateIncomeTax.stateIncomeTaxOwed} variants={['section-total', 'indented', 'bold']} level={1} />
        </CalcGroup>
        {additionalTaxes.length > 0 && (
          <>
            {additionalTaxes.map(additionalTax => (
              <React.Fragment key={additionalTax.taxName}>
                <CalcRow label='' value='' variants={['empty']} />
                <CalcGroup
                  parent={{
                    label: t('taxEstimates:label.taxable_amount_tax_name', 'Taxable Amount for {{taxName}}', { taxName: additionalTax.taxName }),
                    value: additionalTax.taxableAmount,
                  }}
                >
                  <CalcRow label={t('taxEstimates:label.tax_name_rate', '{{taxName}} Rate', { taxName: additionalTax.taxName })} sign='×' value={additionalTax.taxRate} variants={['nested', 'indented']} level={1} />
                  <CalcRow label={t('taxEstimates:label.tax_name_estimate_owed', '{{taxName}} Estimate (Owed)', { taxName: additionalTax.taxName })} value={additionalTax.taxOwed} variants={['section-total', 'indented', 'bold']} level={1} />
                </CalcGroup>
              </React.Fragment>
            ))}
          </>
        )}
        <CalcRow label={t('taxEstimates:label.state_income_tax_estimate_owed', 'State Income Tax Estimate (Owed)')} value={totalStateTax.stateIncomeTaxOwed} variants={['standard']} />
        {additionalTaxes.length > 0 && (
          <CalcRow label={t('taxEstimates:label.additional_state_taxes_estimate_owed', 'Additional State Taxes Estimate (Owed)')} sign='+' value={totalStateTax.additionalTaxesOwed} variants={['nested', 'indented']} level={1} />
        )}
        <CalcRow label={t('taxEstimates:label.amount_applied_state_withholding', 'Amount Applied from State Withholding')} sign='-' value={totalStateTax.stateWithholdings} variants={['nested', 'indented']} level={1} />
        <CalcRow label={t('taxEstimates:label.total_state_tax_estimate', 'Total State Tax Estimate')} value={totalStateTax.totalStateTaxOwed} variants={['total', 'bold']} />
      </TableBody>
    </Table>
  )
}

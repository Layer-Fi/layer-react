import { useState } from 'react'
import { VStack, HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { AdjustedGrossIncomeSection } from './AdjustedGrossIncomeSection'
import { FederalTaxesSection } from './FederalTaxesSection'
import { StateTaxesSection } from './StateTaxesSection'
import { TaxEstimateAnnualProjection } from './TaxEstimateAnnualProjection'
import './taxEstimate.scss'

interface TaxEstimateProps {
  projectedTaxesOwed?: number
  taxesDueDate?: Date
  federalTaxesOwed?: number
  federalTaxesPaid?: number
  stateTaxesOwed?: number
  stateTaxesPaid?: number
  quarterlyEstimates?: QuarterlyEstimate[]
  onNavigateToTaxCalculations?: (type: 'federal' | 'state') => void
}

interface QuarterlyEstimate {
  quarter: string
  amount: number
}

export interface AdjustedGrossIncomeItem {
  id: string
  label: string
  amount: number
  isDeduction?: boolean
  isSeparator?: boolean
  isTotal?: boolean
  formula?: string
}

export interface FederalTaxItem {
  id: string
  label: string
  amount?: number
  isDeduction?: boolean
  isSeparator?: boolean
  isTotal?: boolean
  isOwed?: boolean
  isSubtotal?: boolean
  formula?: string
}

const defaultAdjustedGrossIncomeItems: AdjustedGrossIncomeItem[] = [
  { id: 'business-income', label: 'Business Income', amount: 125000.00 },
  { id: 'w2-income', label: 'W-2 Income', amount: 85000.00 },
  { id: 'deductible-expenses', label: 'Deductible Expenses', amount: -15000.00, isDeduction: true },
  { id: 'deductible-mileage', label: 'Deductible Mileage Expenses', amount: -2500.00, isDeduction: true },
  { id: 'self-employment-deduction', label: 'Self-Employment Deduction', amount: -8500.00, isDeduction: true },
  { id: 'qualified-tip-deduction', label: 'Qualified Tip Deduction', amount: -1200.00, isDeduction: true },
  { id: 'qualified-overtime-deduction', label: 'Qualified Overtime Deduction', amount: -800.00, isDeduction: true },
]

const defaultAdjustedGrossIncome = 192000.00

const defaultFederalDeductions = 25000.00
const defaultBusinessIncomeDeduction = 0.00
const defaultTaxableIncome = 167000.00
const defaultFederalTaxRate = 0.22
const defaultFederalTaxEstimate = 14816.00
const defaultTaxableSocialSecurityIncome = 85000.00
const defaultSocialSecurityTaxRate = 0.062
const defaultSocialSecurityTaxEstimate = 5270.00
const defaultTaxableMedicareIncome = 192000.00
const defaultMedicareTaxRate = 0.0145
const defaultMedicareTaxEstimate = 2784.00

const defaultProjectedTaxesOwed = 18448.00
const defaultFederalTaxesOwed = 14816.00
const defaultFederalTaxesPaid = 150.00
const defaultStateTaxesOwed = 3782.00
const defaultStateTaxesPaid = 0.00
const defaultStateDeductions = 12000.00
const defaultStateTaxableIncome = 180000.00
const defaultStateTaxRate = 0.021
const defaultStateTaxEstimate = 3782.00
const defaultTaxesDueDate = new Date('2022-01-17')

export const TaxEstimate = ({
  projectedTaxesOwed = defaultProjectedTaxesOwed,
  taxesDueDate = defaultTaxesDueDate,
  federalTaxesOwed = defaultFederalTaxesOwed,
  federalTaxesPaid = defaultFederalTaxesPaid,
  stateTaxesOwed = defaultStateTaxesOwed,
  stateTaxesPaid = defaultStateTaxesPaid,
  onNavigateToTaxCalculations,
}: TaxEstimateProps) => {
  const [selectedYear] = useState('2021')

  const agiItems: AdjustedGrossIncomeItem[] = [
    ...defaultAdjustedGrossIncomeItems,
    { id: 'total', label: 'Adjusted Gross Income', amount: defaultAdjustedGrossIncome, isTotal: true },
  ]

  const federalTaxItems: FederalTaxItem[] = [
    { id: 'agi', label: 'Adjusted Gross Income', amount: defaultAdjustedGrossIncome },
    { id: 'federal-deductions', label: 'Federal Deductions', amount: -defaultFederalDeductions, isDeduction: true },
    { id: 'business-deduction', label: 'Business Income Deduction (0.00%)', amount: -defaultBusinessIncomeDeduction, isDeduction: true },
    { id: 'taxable-income', label: '= Taxable Income', amount: defaultTaxableIncome, isSubtotal: true },
    { id: 'federal-rate', label: 'x Federal Tax Rate', amount: defaultFederalTaxRate },
    { id: 'federal-estimate', label: 'Federal Tax Estimate (Owed)', amount: defaultFederalTaxEstimate, isOwed: true, formula: '= Taxable Income x Federal Tax Rate' },
    { id: 'separator-1', label: '', isSeparator: true },
    { id: 'ss-income', label: 'Taxable Social Security Income', amount: defaultTaxableSocialSecurityIncome },
    { id: 'ss-rate', label: 'x Social Security Tax Rate', amount: defaultSocialSecurityTaxRate },
    { id: 'ss-estimate', label: 'Social Security Tax Estimate (Owed)', amount: defaultSocialSecurityTaxEstimate, isOwed: true, formula: '= Taxable Social Security Income x Social Security Tax Rate' },
    { id: 'separator-2', label: '', isSeparator: true },
    { id: 'medicare-income', label: 'Taxable Medicare Income', amount: defaultTaxableMedicareIncome },
    { id: 'medicare-rate', label: 'x Medicare Tax Rate', amount: defaultMedicareTaxRate },
    { id: 'medicare-estimate', label: 'Medicare Tax Estimate (Owed)', amount: defaultMedicareTaxEstimate, isOwed: true, formula: '= Taxable Medicare Income x Medicare Tax Rate' },
    { id: 'separator-3', label: '', isSeparator: true },
    { id: 'federal-estimate-row', label: 'Federal Tax Estimate (Owed)', amount: defaultFederalTaxEstimate, isOwed: true, formula: '= Taxable Income x Federal Tax Rate' },
    { id: 'ss-estimate-row', label: '+ Social Security Tax Estimate (Owed)', amount: defaultSocialSecurityTaxEstimate, isOwed: true, formula: '= Taxable Social Security Income x Social Security Tax Rate' },
    { id: 'medicare-estimate-row', label: '+ Medicare Tax Estimate (Owed)', amount: defaultMedicareTaxEstimate, isOwed: true, formula: '= Taxable Medicare Income x Medicare Tax Rate' },
    { id: 'w2-withholding', label: '- Amount Applied from Federal W-2 Withholding', amount: -defaultFederalTaxesPaid, isDeduction: true },
    { id: 'total-federal', label: 'Total Federal Tax Estimate', amount: defaultFederalTaxesOwed, isTotal: true, isOwed: true, formula: '= Federal Tax Estimate + Social Security Tax Estimate + Medicare Tax Estimate' },
  ]

  const stateTaxItems: FederalTaxItem[] = [
    { id: 'agi', label: 'Adjusted Gross Income', amount: defaultAdjustedGrossIncome },
    { id: 'state-deductions', label: 'State Deductions', amount: -defaultStateDeductions, isDeduction: true },
    { id: 'state-taxable-income', label: '= Taxable Income', amount: defaultStateTaxableIncome, isSubtotal: true },
    { id: 'state-rate', label: 'x State Tax Rate', amount: defaultStateTaxRate },
    { id: 'state-estimate', label: 'State Tax Estimate (Owed)', amount: defaultStateTaxEstimate, isOwed: true, formula: '= Taxable Income x State Tax Rate' },
    { id: 'separator-1', label: '', isSeparator: true },
    { id: 'state-estimate-row', label: 'State Tax Estimate (Owed)', amount: defaultStateTaxEstimate, isOwed: true, formula: '= Taxable Income x State Tax Rate' },
    { id: 'w2-withholding', label: '- Amount Applied from State W-2 Withholding', amount: -defaultStateTaxesPaid, isDeduction: true },
    { id: 'total-state', label: 'Total State Tax Estimate', amount: defaultStateTaxesOwed, isTotal: true, isOwed: true },
  ]

  return (
    <VStack gap='lg' fluid>
      <HStack justify='space-between' align='center' fluid>
        <VStack>
          <Heading size='lg'>Annual Taxes</Heading>
          <Span size='md' variant='subtle'>
            Projected for Year
            {' '}
            {selectedYear}
          </Span>
        </VStack>
      </HStack>
      <VStack gap='md' fluid className='Layer__tax-estimate__overview'>
        <TaxEstimateAnnualProjection
          projectedTaxesOwed={projectedTaxesOwed}
          taxesDueDate={taxesDueDate}
          federalTaxesOwed={federalTaxesOwed}
          federalTaxesPaid={federalTaxesPaid}
          stateTaxesOwed={stateTaxesOwed}
          stateTaxesPaid={stateTaxesPaid}
          onNavigateToTaxCalculations={onNavigateToTaxCalculations}
        />

        <VStack gap='md' fluid className='Layer__tax-estimate__details-container'>
          <VStack gap='sm' fluid>
            <AdjustedGrossIncomeSection items={agiItems} />
            <FederalTaxesSection items={federalTaxItems} />
            <StateTaxesSection items={stateTaxItems} />
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  )
}

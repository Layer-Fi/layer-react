import { VStack, HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { AdjustedGrossIncomeSection } from './AdjustedGrossIncomeSection'
import { FederalTaxesSection } from './FederalTaxesSection'
import { StateTaxesSection } from './StateTaxesSection'
import { TaxEstimateAnnualProjection } from './TaxEstimateAnnualProjection'
import './taxEstimate.scss'
import { taxEstimateDefaults } from './defaults'
import { Separator } from '@components/Separator/Separator'

interface TaxEstimateSummaryProps {
  projectedTaxesOwed?: number
  taxesDueDate?: Date
  federalTaxesOwed?: number
  federalTaxesPaid?: number
  stateTaxesOwed?: number
  stateTaxesPaid?: number
  quarterlyEstimates?: QuarterlyEstimate[]
  onFederalTaxesOwedClick?: () => void
  onFederalTaxesPaidClick?: () => void
  onStateTaxesOwedClick?: () => void
  onStateTaxesPaidClick?: () => void
  federalSectionExpanded?: boolean
  onFederalSectionExpandedChange?: (expanded: boolean) => void
  stateSectionExpanded?: boolean
  onStateSectionExpandedChange?: (expanded: boolean) => void
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
  { id: 'business-income', label: 'Business Income', amount: taxEstimateDefaults.businessIncome },
  // { id: 'w2-income', label: 'W-2 Income', amount: 85000.00 },
  { id: 'deductible-expenses', label: 'Deductible Expenses', amount: -taxEstimateDefaults.deductibleExpenses, isDeduction: true },
  { id: 'deductible-mileage', label: 'Deductible Mileage Expenses', amount: -taxEstimateDefaults.deductibleMileage, isDeduction: true },
  { id: 'self-employment-deduction', label: 'Self-Employment Deduction', amount: -taxEstimateDefaults.selfEmploymentDeduction, isDeduction: true },
  { id: 'qualified-tip-deduction', label: 'Qualified Tip Deduction', amount: -taxEstimateDefaults.qualifiedTipDeduction, isDeduction: true },
  { id: 'qualified-overtime-deduction', label: 'Qualified Overtime Deduction', amount: -taxEstimateDefaults.qualifiedOvertimeDeduction, isDeduction: true },
]

export const TaxEstimateSummary = ({
  projectedTaxesOwed = taxEstimateDefaults.projectedTaxesOwed,
  taxesDueDate = taxEstimateDefaults.taxesDueDate,
  federalTaxesOwed = taxEstimateDefaults.federalTaxesOwed,
  federalTaxesPaid = taxEstimateDefaults.federalTaxesPaid,
  stateTaxesOwed = taxEstimateDefaults.stateTaxesOwed,
  stateTaxesPaid = taxEstimateDefaults.stateTaxesPaid,
  onFederalTaxesOwedClick,
  onFederalTaxesPaidClick,
  onStateTaxesOwedClick,
  onStateTaxesPaidClick,
  federalSectionExpanded,
  onFederalSectionExpandedChange,
  stateSectionExpanded,
  onStateSectionExpandedChange,
}: TaxEstimateSummaryProps) => {
  const agiItems: AdjustedGrossIncomeItem[] = [
    ...defaultAdjustedGrossIncomeItems,
    { id: 'total', label: 'Adjusted Gross Income', amount: taxEstimateDefaults.adjustedGrossIncome, isTotal: true },
  ]

  const federalTaxItems: FederalTaxItem[] = [
    { id: 'agi', label: 'Adjusted Gross Income', amount: taxEstimateDefaults.adjustedGrossIncome },
    { id: 'federal-deductions', label: 'Federal Deductions', amount: -taxEstimateDefaults.federalDeductions, isDeduction: true },
    { id: 'business-deduction', label: 'Business Income Deduction (20.00%)', amount: -taxEstimateDefaults.businessIncomeDeduction, isDeduction: true },
    { id: 'taxable-income', label: '= Taxable Income', amount: taxEstimateDefaults.taxableIncome, isSubtotal: true },
    { id: 'federal-rate', label: 'x Federal Tax Rate', amount: taxEstimateDefaults.federalTaxRate },
    { id: 'federal-estimate', label: 'Federal Tax Estimate (Owed)', amount: taxEstimateDefaults.federalTaxEstimate, isOwed: true, formula: '= Taxable Income x Federal Tax Rate' },
    { id: 'separator-1', label: '', isSeparator: true },
    { id: 'ss-income', label: 'Taxable Social Security Income', amount: taxEstimateDefaults.taxableSocialSecurityIncome },
    { id: 'ss-rate', label: 'x Social Security Tax Rate', amount: taxEstimateDefaults.socialSecurityTaxRate },
    { id: 'ss-estimate', label: 'Social Security Tax Estimate (Owed)', amount: taxEstimateDefaults.socialSecurityTaxEstimate, isOwed: true, formula: '= Taxable Social Security Income x Social Security Tax Rate' },
    { id: 'separator-2', label: '', isSeparator: true },
    { id: 'medicare-income', label: 'Taxable Medicare Income', amount: taxEstimateDefaults.taxableMedicareIncome },
    { id: 'medicare-rate', label: 'x Medicare Tax Rate', amount: taxEstimateDefaults.medicareTaxRate },
    { id: 'medicare-estimate', label: 'Medicare Tax Estimate (Owed)', amount: taxEstimateDefaults.medicareTaxEstimate, isOwed: true, formula: '= Taxable Medicare Income x Medicare Tax Rate' },
    { id: 'separator-3', label: '', isSeparator: true },
    { id: 'federal-estimate-row', label: 'Federal Tax Estimate (Owed)', amount: taxEstimateDefaults.federalTaxEstimate, isOwed: true, formula: '= Taxable Income x Federal Tax Rate' },
    { id: 'ss-estimate-row', label: '+ Social Security Tax Estimate (Owed)', amount: taxEstimateDefaults.socialSecurityTaxEstimate, isOwed: true, formula: '= Taxable Social Security Income x Social Security Tax Rate' },
    { id: 'medicare-estimate-row', label: '+ Medicare Tax Estimate (Owed)', amount: taxEstimateDefaults.medicareTaxEstimate, isOwed: true, formula: '= Taxable Medicare Income x Medicare Tax Rate' },
    // { id: 'w2-withholding', label: '- Amount Applied from Federal W-2 Withholding', amount: -taxEstimateDefaults.federalTaxesPaid, isDeduction: true },
    { id: 'total-federal', label: 'Total Federal Tax Estimate', amount: taxEstimateDefaults.federalTaxesOwed, isTotal: true, isOwed: true, formula: '= Federal Tax Estimate + Social Security Tax Estimate + Medicare Tax Estimate' },
  ]

  const stateTaxItems: FederalTaxItem[] = [
    { id: 'agi', label: 'Adjusted Gross Income', amount: taxEstimateDefaults.adjustedGrossIncome },
    { id: 'state-deductions', label: 'State Deductions & Exemptions', amount: -taxEstimateDefaults.stateDeductions, isDeduction: true },
    { id: 'state-taxable-income', label: 'State Taxable Income', amount: taxEstimateDefaults.stateTaxableIncome, isSubtotal: true },
    { id: 'state-rate', label: 'x State Tax Rate', amount: taxEstimateDefaults.stateTaxRate },
    { id: 'state-estimate', label: 'State Tax Estimate (Owed)', amount: taxEstimateDefaults.stateTaxEstimate, isOwed: true, formula: '= Taxable Income x State Tax Rate' },
    { id: 'separator-1', label: '', isSeparator: true },
    { id: 'state-estimate-row', label: 'State Tax Estimate (Owed)', amount: taxEstimateDefaults.stateTaxEstimate, isOwed: true, formula: '= Taxable Income x State Tax Rate' },
    // { id: 'w2-withholding', label: '- Amount Applied from State W-2 Withholding', amount: -taxEstimateDefaults.stateTaxesPaid, isDeduction: true },
    { id: 'total-state', label: 'Total State Tax Estimate', amount: taxEstimateDefaults.stateTaxesOwed, isTotal: true, isOwed: true },
  ]

  return (
    <VStack gap='lg' fluid>
      <HStack justify='space-between' align='center' fluid>
        <VStack>
          <Heading size='lg'>Estimated Taxes</Heading>
          <Span size='md' variant='subtle'>
            Calculated based on your categorized transactions and tracked mileage.
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
          onFederalTaxesOwedClick={onFederalTaxesOwedClick}
          onFederalTaxesPaidClick={onFederalTaxesPaidClick}
          onStateTaxesOwedClick={onStateTaxesOwedClick}
          onStateTaxesPaidClick={onStateTaxesPaidClick}
        />

        <VStack gap='md' fluid className='Layer__tax-estimate__details-container'>
          <VStack fluid>
            <AdjustedGrossIncomeSection items={agiItems} />
            <Separator />
            <FederalTaxesSection
              items={federalTaxItems}
              expanded={federalSectionExpanded}
              onExpandedChange={onFederalSectionExpandedChange}
            />
            <Separator />
            <StateTaxesSection
              items={stateTaxItems}
              expanded={stateSectionExpanded}
              onExpandedChange={onStateSectionExpandedChange}
            />
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  )
}

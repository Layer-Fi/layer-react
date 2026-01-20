import { VStack, HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { AdjustedGrossIncomeSection } from './AdjustedGrossIncomeSection'
import { FederalTaxesSection } from './FederalTaxesSection'
import { StateTaxesSection } from './StateTaxesSection'
import { TaxEstimateAnnualProjection } from './TaxEstimateAnnualProjection'
import './taxEstimate.scss'
import { Separator } from '@components/Separator/Separator'
import { useTaxEstimates } from '@hooks/useTaxEstimates'

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

export const TaxEstimateSummary = ({
  projectedTaxesOwed,
  taxesDueDate,
  federalTaxesOwed,
  federalTaxesPaid,
  stateTaxesOwed,
  stateTaxesPaid,
  onFederalTaxesOwedClick,
  onFederalTaxesPaidClick,
  onStateTaxesOwedClick,
  onStateTaxesPaidClick,
  federalSectionExpanded,
  onFederalSectionExpandedChange,
  stateSectionExpanded,
  onStateSectionExpandedChange,
}: TaxEstimateSummaryProps) => {
  const { data: taxEstimatesData } = useTaxEstimates({ useMockData: true })

  if (!taxEstimatesData) {
    return null
  }

  const { taxableBusinessIncome, federalTaxes, stateTaxes } = taxEstimatesData.data
  const { breakdown: federalBreakdown } = federalTaxes ?? {}
  const { breakdown: stateBreakdown } = stateTaxes ?? {}

  const agiItems: AdjustedGrossIncomeItem[] = [
    { id: 'business-income', label: 'Business Income', amount: taxableBusinessIncome.businessIncome },
    { id: 'deductible-expenses', label: 'Deductible Expenses', amount: taxableBusinessIncome.deductibleExpenses, isDeduction: true },
    { id: 'deductible-mileage', label: 'Deductible Mileage Expenses', amount: taxableBusinessIncome.deductibleMileageExpenses, isDeduction: true },
    { id: 'self-employment-deduction', label: 'Self-Employment Deduction', amount: taxableBusinessIncome.selfEmploymentDeduction, isDeduction: true },
    { id: 'qualified-tip-deduction', label: 'Qualified Tip Deduction', amount: taxableBusinessIncome.qualifiedTipDeduction, isDeduction: true },
    { id: 'qualified-overtime-deduction', label: 'Qualified Overtime Deduction', amount: taxableBusinessIncome.qualifiedOvertimeDeduction, isDeduction: true },
    { id: 'total', label: 'Adjusted Gross Income', amount: taxableBusinessIncome.adjustedGrossIncome, isTotal: true },
  ]

  const federalTaxRate = federalBreakdown.taxableIncome > 0
    ? federalBreakdown.incomeTax / federalBreakdown.taxableIncome
    : 0
  const socialSecurityTaxableIncome = taxableBusinessIncome.businessIncome
    + taxableBusinessIncome.deductibleExpenses
    + taxableBusinessIncome.deductibleMileageExpenses
  const socialSecurityTaxRate = socialSecurityTaxableIncome > 0
    ? federalBreakdown.socialSecurityTax / socialSecurityTaxableIncome
    : 0
  const medicareTaxRate = socialSecurityTaxableIncome > 0
    ? federalBreakdown.medicareTax / socialSecurityTaxableIncome
    : 0

  const federalTaxItems: FederalTaxItem[] = [
    { id: 'agi', label: 'Adjusted Gross Income', amount: federalBreakdown.adjustedGrossIncome },
    { id: 'federal-deductions', label: 'Federal Deductions', amount: -federalBreakdown.standardDeduction, isDeduction: true },
    { id: 'business-deduction', label: `Business Income Deduction (${(20).toFixed(2)}%)`, amount: -federalBreakdown.qbiDeduction, isDeduction: true },
    { id: 'taxable-income', label: '= Taxable Income', amount: federalBreakdown.taxableIncome, isSubtotal: true },
    { id: 'federal-rate', label: 'x Federal Tax Rate', amount: federalTaxRate },
    { id: 'federal-estimate', label: 'Federal Tax Estimate (Owed)', amount: federalBreakdown.incomeTax, isOwed: true, formula: '= Taxable Income x Federal Tax Rate' },
    { id: 'separator-1', label: '', isSeparator: true },
    { id: 'ss-income', label: 'Taxable Social Security Income', amount: socialSecurityTaxableIncome },
    { id: 'ss-rate', label: 'x Social Security Tax Rate', amount: socialSecurityTaxRate },
    { id: 'ss-estimate', label: 'Social Security Tax Estimate (Owed)', amount: federalBreakdown.socialSecurityTax, isOwed: true, formula: '= Taxable Social Security Income x Social Security Tax Rate' },
    { id: 'separator-2', label: '', isSeparator: true },
    { id: 'medicare-income', label: 'Taxable Medicare Income', amount: socialSecurityTaxableIncome },
    { id: 'medicare-rate', label: 'x Medicare Tax Rate', amount: medicareTaxRate },
    { id: 'medicare-estimate', label: 'Medicare Tax Estimate (Owed)', amount: federalBreakdown.medicareTax, isOwed: true, formula: '= Taxable Medicare Income x Medicare Tax Rate' },
    { id: 'separator-3', label: '', isSeparator: true },
    { id: 'federal-estimate-row', label: 'Federal Tax Estimate (Owed)', amount: federalBreakdown.incomeTax, isOwed: true, formula: '= Taxable Income x Federal Tax Rate' },
    { id: 'ss-estimate-row', label: '+ Social Security Tax Estimate (Owed)', amount: federalBreakdown.socialSecurityTax, isOwed: true, formula: '= Taxable Social Security Income x Social Security Tax Rate' },
    { id: 'medicare-estimate-row', label: '+ Medicare Tax Estimate (Owed)', amount: federalBreakdown.medicareTax, isOwed: true, formula: '= Taxable Medicare Income x Medicare Tax Rate' },
    { id: 'total-federal', label: 'Total Federal Tax Estimate', amount: federalTaxes.taxesOwed, isTotal: true, isOwed: true, formula: '= Federal Tax Estimate + Social Security Tax Estimate + Medicare Tax Estimate' },
  ]

  const stateTaxRate = stateBreakdown.taxableIncome > 0
    ? stateBreakdown.stateTaxEstimate / stateBreakdown.taxableIncome
    : 0
  const stateDeductions = federalBreakdown.adjustedGrossIncome - stateBreakdown.taxableIncome

  const stateTaxItems: FederalTaxItem[] = [
    { id: 'agi', label: 'Adjusted Gross Income', amount: federalBreakdown.adjustedGrossIncome },
    { id: 'state-deductions', label: 'State Deductions & Exemptions', amount: -stateDeductions, isDeduction: true },
    { id: 'state-taxable-income', label: 'State Taxable Income', amount: stateBreakdown.taxableIncome, isSubtotal: true },
    { id: 'state-rate', label: 'x State Tax Rate', amount: stateTaxRate },
    { id: 'state-estimate', label: 'State Tax Estimate (Owed)', amount: stateBreakdown.stateTaxEstimate, isOwed: true, formula: '= Taxable Income x State Tax Rate' },
    { id: 'separator-1', label: '', isSeparator: true },
    { id: 'state-estimate-row', label: 'State Tax Estimate (Owed)', amount: stateBreakdown.stateTaxEstimate, isOwed: true, formula: '= Taxable Income x State Tax Rate' },
    { id: 'total-state', label: 'Total State Tax Estimate', amount: stateTaxes.taxesOwed, isTotal: true, isOwed: true },
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

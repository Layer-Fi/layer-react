import { VStack, HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { AdjustedGrossIncomeSection } from './AdjustedGrossIncomeSection'
import { FederalTaxesSection } from './FederalTaxesSection'
import { StateTaxesSection } from './StateTaxesSection'
import { TaxEstimateAnnualProjection } from './TaxEstimateAnnualProjection'
import './taxEstimate.scss'
import { Separator } from '@components/Separator/Separator'
import { useTaxDetails } from '@hooks/useTaxEstimates'

interface TaxEstimateSummaryProps {
  year: number
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
  year,
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
  const { data: taxDetailsData } = useTaxDetails({ year })

  if (!taxDetailsData) {
    return null
  }

  const { adjustedGrossIncome, taxes } = taxDetailsData.data
  const { usFederal } = taxes
  const { federalIncomeTax, socialSecurityTax, medicareTax, medicareSurtax, totalFederalTax } = usFederal ?? {}

  const { income, deductions } = adjustedGrossIncome
  const agiItems: AdjustedGrossIncomeItem[] = [
    { id: 'business-income', label: 'Business Revenue', amount: (income.businessRevenue ?? 0) / 100 },
    { id: 'deductible-expenses', label: 'Business Expenses', amount: (deductions.businessExpenses ?? 0) / 100, isDeduction: true },
    ...(deductions.vehicleExpense && deductions.vehicleExpense.amount > 0
      ? [{
        id: 'vehicle-expense',
        label: `Vehicle Expense (${deductions.vehicleExpense.method})`,
        amount: (deductions.vehicleExpense.amount ?? 0) / 100,
        isDeduction: true,
      }]
      : []),
    ...(deductions.homeOffice && deductions.homeOffice.method !== 'NONE' && deductions.homeOffice.amount > 0
      ? [{
        id: 'home-office',
        label: `Home Office Deduction (${deductions.homeOffice.method})`,
        amount: (deductions.homeOffice.amount ?? 0) / 100,
        isDeduction: true,
      }]
      : []),
    { id: 'self-employment-deduction', label: 'Self-Employment Tax Deduction', amount: (deductions.selfEmploymentTaxDeduction ?? 0) / 100, isDeduction: true },
    { id: 'qualified-tip-deduction', label: 'Qualified Tip Deduction', amount: (deductions.qualifiedTipDeduction ?? 0) / 100, isDeduction: true },
    { id: 'qualified-overtime-deduction', label: 'Qualified Overtime Deduction', amount: (deductions.qualifiedOvertimeDeduction ?? 0) / 100, isDeduction: true },
    { id: 'total', label: 'Adjusted Gross Income', amount: (adjustedGrossIncome.totalAdjustedGrossIncome ?? 0) / 100, isTotal: true },
  ]

  if (!federalIncomeTax || !socialSecurityTax || !medicareTax || !totalFederalTax) {
    return null
  }

  const parseRate = (rateString: string): number => {
    if (!rateString) return 0
    const cleaned = rateString.replace('%', '').trim()
    const parsed = parseFloat(cleaned)
    if (isNaN(parsed)) {
      return 0
    }
    return parsed / 100
  }

  const federalTaxRate = federalIncomeTax.taxableIncome > 0
    ? parseRate(federalIncomeTax.effectiveFederalTaxRate)
    : 0
  const qbiRate = parseRate(federalIncomeTax.qbiEffectiveRate)
  const socialSecurityTaxRate = parseRate(socialSecurityTax.socialSecurityTaxRate)
  const medicareTaxRate = parseRate(medicareTax.medicareTaxRate)
  const medicareSurtaxRate = medicareSurtax ? parseRate(medicareSurtax.medicareSurtaxRate) : 0

  const federalTaxItems: FederalTaxItem[] = [
    { id: 'agi', label: 'Adjusted Gross Income', amount: (adjustedGrossIncome.totalAdjustedGrossIncome ?? 0) / 100 },
    { id: 'federal-deductions', label: 'Federal Deductions', amount: -(federalIncomeTax.federalDeductions ?? 0) / 100, isDeduction: true },
    { id: 'business-deduction', label: `Qualified Business Income Deduction (${(qbiRate * 100).toFixed(2)}%)`, amount: -(federalIncomeTax.qualifiedBusinessIncomeDeduction ?? 0) / 100, isDeduction: true },
    { id: 'taxable-income', label: '= Taxable Income', amount: (federalIncomeTax.taxableIncome ?? 0) / 100, isSubtotal: true },
    { id: 'federal-rate', label: 'x Federal Tax Rate', amount: federalTaxRate },
    { id: 'federal-estimate', label: 'Federal Tax Estimate (Owed)', amount: (federalIncomeTax.federalIncomeTaxOwed ?? 0) / 100, isOwed: true, formula: '= Taxable Income x Federal Tax Rate' },
    { id: 'separator-1', label: '', isSeparator: true },
    { id: 'ss-income', label: 'Taxable Social Security Income', amount: (socialSecurityTax.socialSecurityIncome ?? 0) / 100 },
    { id: 'ss-rate', label: 'x Social Security Tax Rate', amount: socialSecurityTaxRate },
    { id: 'ss-estimate', label: 'Social Security Tax Estimate (Owed)', amount: (socialSecurityTax.socialSecurityTaxOwed ?? 0) / 100, isOwed: true, formula: '= Taxable Social Security Income x Social Security Tax Rate' },
    { id: 'separator-2', label: '', isSeparator: true },
    { id: 'medicare-income', label: 'Taxable Medicare Income', amount: (medicareTax.medicareIncome ?? 0) / 100 },
    { id: 'medicare-rate', label: 'x Medicare Tax Rate', amount: medicareTaxRate },
    { id: 'medicare-estimate', label: 'Medicare Tax Estimate (Owed)', amount: (medicareTax.medicareTaxOwed ?? 0) / 100, isOwed: true, formula: '= Taxable Medicare Income x Medicare Tax Rate' },
    ...(medicareSurtax && medicareSurtax.medicareSurtaxOwed > 0
      ? [
        { id: 'separator-medicare-surtax', label: '', isSeparator: true },
        { id: 'medicare-surtax-income', label: 'Medicare Surtax Income', amount: (medicareSurtax.medicareSurtaxIncome ?? 0) / 100 },
        { id: 'medicare-surtax-rate', label: 'x Medicare Surtax Rate', amount: medicareSurtaxRate },
        { id: 'medicare-surtax-estimate', label: 'Medicare Surtax Estimate (Owed)', amount: (medicareSurtax.medicareSurtaxOwed ?? 0) / 100, isOwed: true, formula: '= Medicare Surtax Income x Medicare Surtax Rate' },
        { id: 'separator-4', label: '', isSeparator: true },
      ]
      : []),
    { id: 'federal-estimate-row', label: 'Federal Tax Estimate (Owed)', amount: (federalIncomeTax.federalIncomeTaxOwed ?? 0) / 100, isOwed: true, formula: '= Taxable Income x Federal Tax Rate' },
    { id: 'ss-estimate-row', label: '+ Social Security Tax Estimate (Owed)', amount: (socialSecurityTax.socialSecurityTaxOwed ?? 0) / 100, isOwed: true, formula: '= Taxable Social Security Income x Social Security Tax Rate' },
    { id: 'medicare-estimate-row', label: '+ Medicare Tax Estimate (Owed)', amount: (medicareTax.medicareTaxOwed ?? 0) / 100, isOwed: true, formula: '= Taxable Medicare Income x Medicare Tax Rate' },
    ...(medicareSurtax && medicareSurtax.medicareSurtaxOwed > 0
      ? [{ id: 'medicare-surtax-estimate-row', label: '+ Medicare Surtax Estimate (Owed)', amount: (medicareSurtax.medicareSurtaxOwed ?? 0) / 100, isOwed: true, formula: '= Medicare Surtax Income x Medicare Surtax Rate' }]
      : []),
    { id: 'total-federal', label: 'Total Federal Tax Estimate', amount: (totalFederalTax.totalFederalTaxOwed ?? 0) / 100, isTotal: true, isOwed: true, formula: '= Federal Tax Estimate + Social Security Tax Estimate + Medicare Tax Estimate + Medicare Surtax Estimate' },
  ]

  const stateTaxItems: FederalTaxItem[] = [
    { id: 'agi', label: 'Adjusted Gross Income', amount: (adjustedGrossIncome.totalAdjustedGrossIncome ?? 0) / 100 },
    { id: 'state-deductions', label: 'State Deductions & Exemptions', amount: 0, isDeduction: true },
    { id: 'state-taxable-income', label: 'State Taxable Income', amount: 0, isSubtotal: true },
    { id: 'state-rate', label: 'x State Tax Rate', amount: 0 },
    { id: 'state-estimate', label: 'State Tax Estimate (Owed)', amount: 0, isOwed: true, formula: '= Taxable Income x State Tax Rate' },
    { id: 'separator-1', label: '', isSeparator: true },
    { id: 'state-estimate-row', label: 'State Tax Estimate (Owed)', amount: 0, isOwed: true, formula: '= Taxable Income x State Tax Rate' },
    { id: 'total-state', label: 'Total State Tax Estimate', amount: 0, isTotal: true, isOwed: true },
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

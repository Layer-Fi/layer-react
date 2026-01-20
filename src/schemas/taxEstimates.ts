import { pipe, Schema } from 'effect'

import { FilingStatusSchema } from './taxEstimatesCommon'

const UsTaxEstimatesInputsSchema = Schema.Struct({
  federalFilingStatus: pipe(
    Schema.propertySignature(Schema.NullishOr(FilingStatusSchema)),
    Schema.fromKey('federal_filing_status'),
  ),
  stateFilingStatus: pipe(
    Schema.propertySignature(Schema.NullishOr(FilingStatusSchema)),
    Schema.fromKey('state_filing_status'),
  ),
  w2Income: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('w2_income'),
  ),
  businessIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('business_income'),
  ),
  otherIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('other_income'),
  ),
  expenses: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('expenses'),
  ),
  deductibleExpenses: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('deductible_expenses'),
  ),
  deductibleMileageExpenses: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('deductible_mileage_expenses'),
  ),
  deductibleNonMileageExpenses: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('deductible_non_mileage_expenses'),
  ),
})

export type UsTaxEstimatesInputs = typeof UsTaxEstimatesInputsSchema.Type

const UsTaxEstimatesResultsSchema = Schema.Struct({
  overallTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('overall_tax'),
  ),
  overallTaxSavings: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('overall_tax_savings'),
  ),
  overallTaxUnpaid: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('overall_tax_unpaid'),
  ),
  annualPaymentDueDate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('annual_payment_due_date'),
  ),
  afterTaxIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('after_tax_income'),
  ),
})

export type UsTaxEstimatesResults = typeof UsTaxEstimatesResultsSchema.Type

const MedicareSurtaxEstimateSchema = Schema.Struct({
  amount: Schema.NullishOr(Schema.Number),
  rate: Schema.NullishOr(Schema.Number),
})

export type MedicareSurtaxEstimate = typeof MedicareSurtaxEstimateSchema.Type

const SelfEmploymentTaxEstimateSchema = Schema.Struct({
  amount: Schema.NullishOr(Schema.Number),
  rate: Schema.NullishOr(Schema.Number),
  socialSecurityTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('social_security_tax'),
  ),
  medicareTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('medicare_tax'),
  ),
})

export type SelfEmploymentTaxEstimate = typeof SelfEmploymentTaxEstimateSchema.Type

const EmploymentTaxEstimateSchema = Schema.Struct({
  amount: Schema.NullishOr(Schema.Number),
  rate: Schema.NullishOr(Schema.Number),
  socialSecurityTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('social_security_tax'),
  ),
  medicareTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('medicare_tax'),
  ),
})

export type EmploymentTaxEstimate = typeof EmploymentTaxEstimateSchema.Type

const UsFederalTaxEstimateSchema = Schema.Struct({
  w2MarginalTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('w2_marginal_tax_rate'),
  ),
  businessMarginalTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('business_marginal_tax_rate'),
  ),
  adjustedGrossIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('adjusted_gross_income'),
  ),
  businessIncomeDeduction: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('business_income_deduction'),
  ),
  businessIncomeDeductionEffectiveRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('business_income_deduction_effective_rate'),
  ),
  federalDeduction: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('federal_deduction'),
  ),
  qualifiedTipDeduction: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('qualified_tip_deduction'),
  ),
  qualifiedOvertimeDeduction: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('qualified_overtime_deduction'),
  ),
  taxableIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('taxable_income'),
  ),
  federalEffectiveTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('federal_effective_tax_rate'),
  ),
  federalTaxAmount: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('federal_tax_amount'),
  ),
  medicareSurtax: Schema.NullishOr(MedicareSurtaxEstimateSchema),
  selfEmploymentTax: Schema.NullishOr(SelfEmploymentTaxEstimateSchema),
  employmentTax: Schema.NullishOr(EmploymentTaxEstimateSchema),
  alternativeMinimumTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('alternative_minimum_tax'),
  ),
  taxAmountWithoutTaxCredit: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('tax_amount_without_tax_credit'),
  ),
  dependentTaxCredit: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('dependent_tax_credit'),
  ),
  totalTaxCredit: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('total_tax_credit'),
  ),
  totalTaxCreditAppliedToTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('total_tax_credit_applied_to_tax'),
  ),
  taxBeforeWithholding: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('tax_before_withholding'),
  ),
  effectiveTaxRateBeforeWithholding: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('effective_tax_rate_before_withholding'),
  ),
  withholdingAppliedToTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('withholding_applied_to_tax'),
  ),
  taxAmount: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('tax_amount'),
  ),
  taxUnpaid: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('tax_unpaid'),
  ),
  effectiveTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('effective_tax_rate'),
  ),
})

export type UsFederalTaxEstimate = typeof UsFederalTaxEstimateSchema.Type

const UsStateTaxEstimateSchema = Schema.Struct({
  w2MarginalTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('w2_marginal_tax_rate'),
  ),
  businessMarginalTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('business_marginal_tax_rate'),
  ),
  adjustedGrossIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('adjusted_gross_income'),
  ),
  stateDeduction: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('state_deduction'),
  ),
  taxableIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('taxable_income'),
  ),
  preCreditEffectiveTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('pre_credit_effective_tax_rate'),
  ),
  taxAmountWithoutTaxCredit: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('tax_amount_without_tax_credit'),
  ),
  totalTaxCredit: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('total_tax_credit'),
  ),
  totalTaxCreditAppliedToTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('total_tax_credit_applied_to_tax'),
  ),
  taxBeforeWithholding: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('tax_before_withholding'),
  ),
  effectiveTaxRateBeforeWithholding: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('effective_tax_rate_before_withholding'),
  ),
  withholdingAppliedToTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('withholding_applied_to_tax'),
  ),
  taxAmount: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('tax_amount'),
  ),
  taxUnpaid: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('tax_unpaid'),
  ),
  effectiveTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('effective_tax_rate'),
  ),
})

export type UsStateTaxEstimate = typeof UsStateTaxEstimateSchema.Type

const QuarterlyEstimateSchema = Schema.Struct({
  dueDate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('due_date'),
  ),
  federalTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Struct({
      amount: Schema.NullishOr(Schema.Number),
      paid: Schema.NullishOr(Schema.Number),
      remaining: Schema.NullishOr(Schema.Number),
    }))),
    Schema.fromKey('federal_tax'),
  ),
  stateTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Struct({
      amount: Schema.NullishOr(Schema.Number),
      paid: Schema.NullishOr(Schema.Number),
      remaining: Schema.NullishOr(Schema.Number),
    }))),
    Schema.fromKey('state_tax'),
  ),
})

export type QuarterlyEstimate = typeof QuarterlyEstimateSchema.Type

const UsQuarterlyEstimatesSchema = Schema.Struct({
  q1: Schema.NullishOr(QuarterlyEstimateSchema),
  q2: Schema.NullishOr(QuarterlyEstimateSchema),
  q3: Schema.NullishOr(QuarterlyEstimateSchema),
  q4: Schema.NullishOr(QuarterlyEstimateSchema),
})

export type UsQuarterlyEstimates = typeof UsQuarterlyEstimatesSchema.Type

const UsTaxEstimatesSchema = Schema.Struct({
  inputs: pipe(
    Schema.propertySignature(Schema.NullishOr(UsTaxEstimatesInputsSchema)),
    Schema.fromKey('inputs'),
  ),
  results: pipe(
    Schema.propertySignature(Schema.NullishOr(UsTaxEstimatesResultsSchema)),
    Schema.fromKey('results'),
  ),
  federalTax: pipe(
    Schema.propertySignature(Schema.NullishOr(UsFederalTaxEstimateSchema)),
    Schema.fromKey('federal_tax'),
  ),
  stateTax: pipe(
    Schema.propertySignature(Schema.NullishOr(UsStateTaxEstimateSchema)),
    Schema.fromKey('state_tax'),
  ),
  quarterlyEstimates: pipe(
    Schema.propertySignature(Schema.NullishOr(UsQuarterlyEstimatesSchema)),
    Schema.fromKey('quarterly_estimates'),
  ),
})

export type UsTaxEstimates = typeof UsTaxEstimatesSchema.Type

const ApiTaxEstimatesSchema = Schema.Struct({
  country: Schema.NullishOr(Schema.String),
  state: Schema.NullishOr(Schema.String),
  year: Schema.Number,
  usEstimates: pipe(
    Schema.propertySignature(Schema.NullishOr(UsTaxEstimatesSchema)),
    Schema.fromKey('us_estimates'),
  ),
  caEstimates: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Struct({}))),
    Schema.fromKey('ca_estimates'),
  ),
})

export type ApiTaxEstimates = typeof ApiTaxEstimatesSchema.Type

export const TaxEstimateResponseSchema = Schema.Struct({
  data: ApiTaxEstimatesSchema,
})

export type TaxEstimateResponse = typeof TaxEstimateResponseSchema.Type

export * from './taxEstimatesCommon'
export * from './taxEstimatesDetails'
export * from './taxEstimatesOverview'
export * from './taxEstimatesPayments'
export * from './taxProfile'

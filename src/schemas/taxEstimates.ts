import { pipe, Schema } from 'effect'

import { FilingStatusSchema } from './taxEstimatesCommon'

const UsTaxEstimatesInputsSchema = Schema.Struct({
  federalFilingStatus: pipe(
    Schema.propertySignature(Schema.NullishOr(FilingStatusSchema)),
    Schema.fromKey('federalFilingStatus'),
  ),
  stateFilingStatus: pipe(
    Schema.propertySignature(Schema.NullishOr(FilingStatusSchema)),
    Schema.fromKey('stateFilingStatus'),
  ),
  w2Income: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('w2Income'),
  ),
  businessIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('businessIncome'),
  ),
  otherIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('otherIncome'),
  ),
  expenses: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('expenses'),
  ),
  deductibleExpenses: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('deductibleExpenses'),
  ),
  deductibleMileageExpenses: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('deductibleMileageExpenses'),
  ),
  deductibleNonMileageExpenses: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('deductibleNonMileageExpenses'),
  ),
})

export type UsTaxEstimatesInputs = typeof UsTaxEstimatesInputsSchema.Type

const UsTaxEstimatesResultsSchema = Schema.Struct({
  overallTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('overallTax'),
  ),
  overallTaxSavings: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('overallTaxSavings'),
  ),
  overallTaxUnpaid: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('overallTaxUnpaid'),
  ),
  annualPaymentDueDate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('annualPaymentDueDate'),
  ),
  afterTaxIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('afterTaxIncome'),
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
    Schema.fromKey('socialSecurityTax'),
  ),
  medicareTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('medicareTax'),
  ),
})

export type SelfEmploymentTaxEstimate = typeof SelfEmploymentTaxEstimateSchema.Type

const EmploymentTaxEstimateSchema = Schema.Struct({
  amount: Schema.NullishOr(Schema.Number),
  rate: Schema.NullishOr(Schema.Number),
  socialSecurityTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('socialSecurityTax'),
  ),
  medicareTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('medicareTax'),
  ),
})

export type EmploymentTaxEstimate = typeof EmploymentTaxEstimateSchema.Type

const UsFederalTaxEstimateSchema = Schema.Struct({
  w2MarginalTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('w2MarginalTaxRate'),
  ),
  businessMarginalTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('businessMarginalTaxRate'),
  ),
  adjustedGrossIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('adjustedGrossIncome'),
  ),
  businessIncomeDeduction: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('businessIncomeDeduction'),
  ),
  businessIncomeDeductionEffectiveRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('businessIncomeDeductionEffectiveRate'),
  ),
  federalDeduction: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('federalDeduction'),
  ),
  qualifiedTipDeduction: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('qualifiedTipDeduction'),
  ),
  qualifiedOvertimeDeduction: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('qualifiedOvertimeDeduction'),
  ),
  taxableIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('taxableIncome'),
  ),
  federalEffectiveTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('federalEffectiveTaxRate'),
  ),
  federalTaxAmount: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('federalTaxAmount'),
  ),
  medicareSurtax: Schema.NullishOr(MedicareSurtaxEstimateSchema),
  selfEmploymentTax: Schema.NullishOr(SelfEmploymentTaxEstimateSchema),
  employmentTax: Schema.NullishOr(EmploymentTaxEstimateSchema),
  alternativeMinimumTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('alternativeMinimumTax'),
  ),
  taxAmountWithoutTaxCredit: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('taxAmountWithoutTaxCredit'),
  ),
  dependentTaxCredit: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('dependentTaxCredit'),
  ),
  totalTaxCredit: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('totalTaxCredit'),
  ),
  totalTaxCreditAppliedToTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('totalTaxCreditAppliedToTax'),
  ),
  taxBeforeWithholding: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('taxBeforeWithholding'),
  ),
  effectiveTaxRateBeforeWithholding: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('effectiveTaxRateBeforeWithholding'),
  ),
  withholdingAppliedToTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('withholdingAppliedToTax'),
  ),
  taxAmount: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('taxAmount'),
  ),
  taxUnpaid: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('taxUnpaid'),
  ),
  effectiveTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('effectiveTaxRate'),
  ),
})

export type UsFederalTaxEstimate = typeof UsFederalTaxEstimateSchema.Type

const UsStateTaxEstimateSchema = Schema.Struct({
  w2MarginalTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('w2MarginalTaxRate'),
  ),
  businessMarginalTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('businessMarginalTaxRate'),
  ),
  adjustedGrossIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('adjustedGrossIncome'),
  ),
  stateDeduction: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('stateDeduction'),
  ),
  taxableIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('taxableIncome'),
  ),
  preCreditEffectiveTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('preCreditEffectiveTaxRate'),
  ),
  taxAmountWithoutTaxCredit: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('taxAmountWithoutTaxCredit'),
  ),
  totalTaxCredit: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('totalTaxCredit'),
  ),
  totalTaxCreditAppliedToTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('totalTaxCreditAppliedToTax'),
  ),
  taxBeforeWithholding: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('taxBeforeWithholding'),
  ),
  effectiveTaxRateBeforeWithholding: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('effectiveTaxRateBeforeWithholding'),
  ),
  withholdingAppliedToTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('withholdingAppliedToTax'),
  ),
  taxAmount: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('taxAmount'),
  ),
  taxUnpaid: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('taxUnpaid'),
  ),
  effectiveTaxRate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('effectiveTaxRate'),
  ),
})

export type UsStateTaxEstimate = typeof UsStateTaxEstimateSchema.Type

const QuarterlyEstimateSchema = Schema.Struct({
  dueDate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('dueDate'),
  ),
  federalTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Struct({
      amount: Schema.NullishOr(Schema.Number),
      paid: Schema.NullishOr(Schema.Number),
      remaining: Schema.NullishOr(Schema.Number),
    }))),
    Schema.fromKey('federalTax'),
  ),
  stateTax: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Struct({
      amount: Schema.NullishOr(Schema.Number),
      paid: Schema.NullishOr(Schema.Number),
      remaining: Schema.NullishOr(Schema.Number),
    }))),
    Schema.fromKey('stateTax'),
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
  inputs: Schema.NullishOr(UsTaxEstimatesInputsSchema),
  results: Schema.NullishOr(UsTaxEstimatesResultsSchema),
  federalTax: Schema.NullishOr(UsFederalTaxEstimateSchema),
  stateTax: Schema.NullishOr(UsStateTaxEstimateSchema),
  quarterlyEstimates: Schema.NullishOr(UsQuarterlyEstimatesSchema),
})

export type UsTaxEstimates = typeof UsTaxEstimatesSchema.Type

const ApiTaxEstimatesSchema = Schema.Struct({
  country: Schema.NullishOr(Schema.String),
  state: Schema.NullishOr(Schema.String),
  year: Schema.Number,
  usEstimates: pipe(
    Schema.propertySignature(UsTaxEstimatesSchema),
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

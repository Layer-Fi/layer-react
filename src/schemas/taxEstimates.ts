import { Schema, pipe } from 'effect'

// Federal Taxes Breakdown Schema
const FederalTaxesBreakdownSchema = Schema.Struct({
  adjustedGrossIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('adjusted_gross_income'),
  ),
  standardDeduction: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('standard_deduction'),
  ),
  qbiDeduction: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('qbi_deduction'),
  ),
  taxableIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxable_income'),
  ),
  incomeTax: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('income_tax'),
  ),
  socialSecurityTax: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('social_security_tax'),
  ),
  medicareTax: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('medicare_tax'),
  ),
})

export type FederalTaxesBreakdown = typeof FederalTaxesBreakdownSchema.Type

// Federal Taxes Schema
const FederalTaxesSchema = Schema.Struct({
  total: Schema.Number,
  taxesOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxes_owed'),
  ),
  taxesPaid: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxes_paid'),
  ),
  breakdown: FederalTaxesBreakdownSchema,
})

export type FederalTaxes = typeof FederalTaxesSchema.Type

// State Taxes Breakdown Schema
const StateTaxesBreakdownSchema = Schema.Struct({
  taxableIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxable_income'),
  ),
  stateTaxEstimate: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('state_tax_estimate'),
  ),
})

export type StateTaxesBreakdown = typeof StateTaxesBreakdownSchema.Type

// State Taxes Schema
const StateTaxesSchema = Schema.Struct({
  total: Schema.Number,
  taxesOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxes_owed'),
  ),
  taxesPaid: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxes_paid'),
  ),
  breakdown: StateTaxesBreakdownSchema,
})

export type StateTaxes = typeof StateTaxesSchema.Type

// Taxable Business Income Schema
const TaxableBusinessIncomeSchema = Schema.Struct({
  businessIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('business_income'),
  ),
  deductibleExpenses: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('deductible_expenses'),
  ),
  deductibleMileageExpenses: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('deductible_mileage_expenses'),
  ),
  selfEmploymentDeduction: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('self_employment_deduction'),
  ),
  qualifiedTipDeduction: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('qualified_tip_deduction'),
  ),
  qualifiedOvertimeDeduction: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('qualified_overtime_deduction'),
  ),
  adjustedGrossIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('adjusted_gross_income'),
  ),
})

export type TaxableBusinessIncome = typeof TaxableBusinessIncomeSchema.Type

// Quarterly Estimate Schema
export enum Quarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

const QuarterSchema = Schema.Enums(Quarter)

const QuarterlyEstimateSchema = Schema.Struct({
  quarter: QuarterSchema,
  amount: Schema.Number,
  dueDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('due_date'),
  ),
})

export type QuarterlyEstimate = typeof QuarterlyEstimateSchema.Type

// Tax Estimate Schema
const TaxEstimateSchema = Schema.Struct({
  projectedTaxesOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('projected_taxes_owed'),
  ),
  taxesDueDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('taxes_due_date'),
  ),
  federalTaxes: pipe(
    Schema.propertySignature(FederalTaxesSchema),
    Schema.fromKey('federal_taxes'),
  ),
  stateTaxes: pipe(
    Schema.propertySignature(StateTaxesSchema),
    Schema.fromKey('state_taxes'),
  ),
  taxableBusinessIncome: pipe(
    Schema.propertySignature(TaxableBusinessIncomeSchema),
    Schema.fromKey('taxable_business_income'),
  ),
  quarterlyEstimates: pipe(
    Schema.propertySignature(Schema.Array(QuarterlyEstimateSchema)),
    Schema.fromKey('quarterly_estimates'),
  ),
})

export type TaxEstimate = typeof TaxEstimateSchema.Type

export const TaxEstimateResponseSchema = Schema.Struct({
  data: TaxEstimateSchema,
})

export type TaxEstimateResponse = typeof TaxEstimateResponseSchema.Type

// Tax Deadline Schema
const TaxDeadlineSchema = Schema.Struct({
  date: Schema.String,
  description: Schema.String,
  amount: Schema.Number,
})

export type TaxDeadline = typeof TaxDeadlineSchema.Type

// Estimated Taxes Schema
const EstimatedTaxesSchema = Schema.Struct({
  totalOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_owed'),
  ),
  taxesDueDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('taxes_due_date'),
  ),
  federal: Schema.Number,
  state: Schema.Number,
})

// Tax Overview Schema
const TaxOverviewSchema = Schema.Struct({
  taxableIncomeEstimate: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxable_income_estimate'),
  ),
  excludesPendingTransactions: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('excludes_pending_transactions'),
  ),
  totalIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_income'),
  ),
  deductions: Schema.Number,
  estimatedTaxes: pipe(
    Schema.propertySignature(EstimatedTaxesSchema),
    Schema.fromKey('estimated_taxes'),
  ),
  deadlines: Schema.Array(TaxDeadlineSchema),
})

export type TaxOverview = typeof TaxOverviewSchema.Type

export const TaxOverviewResponseSchema = Schema.Struct({
  data: TaxOverviewSchema,
})

export type TaxOverviewResponse = typeof TaxOverviewResponseSchema.Type

// Checklist Item Schema
export enum ChecklistStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

const ChecklistStatusSchema = Schema.Enums(ChecklistStatus)

const ChecklistItemSchema = Schema.Struct({
  id: Schema.String,
  description: Schema.String,
  amount: Schema.Number,
  status: ChecklistStatusSchema,
  actionUrl: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('action_url'),
  ),
})

export type ChecklistItem = typeof ChecklistItemSchema.Type

// Tax Checklist Schema
const TaxChecklistSchema = Schema.Struct({
  items: Schema.Array(ChecklistItemSchema),
})

export type TaxChecklist = typeof TaxChecklistSchema.Type

export const TaxChecklistResponseSchema = Schema.Struct({
  data: TaxChecklistSchema,
})

export type TaxChecklistResponse = typeof TaxChecklistResponseSchema.Type

// Quarterly Payment Schema
const QuarterlyPaymentSchema = Schema.Struct({
  quarter: QuarterSchema,
  rolledOverFromPreviousQuarter: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('rolled_over_from_previous_quarter'),
  ),
  owedThisQuarter: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('owed_this_quarter'),
  ),
  totalPaid: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_paid'),
  ),
  total: Schema.Number,
})

export type QuarterlyPayment = typeof QuarterlyPaymentSchema.Type

// Tax Payments Schema
const TaxPaymentsSchema = Schema.Struct({
  quarters: Schema.Array(QuarterlyPaymentSchema),
})

export type TaxPayments = typeof TaxPaymentsSchema.Type

export const TaxPaymentsResponseSchema = Schema.Struct({
  data: TaxPaymentsSchema,
})

export type TaxPaymentsResponse = typeof TaxPaymentsResponseSchema.Type

// Filing Status Enum
export enum FilingStatus {
  SINGLE = 'single',
  MARRIED_FILING_JOINTLY = 'married_filing_jointly',
  MARRIED_FILING_SEPARATELY = 'married_filing_separately',
  HEAD_OF_HOUSEHOLD = 'head_of_household',
  QUALIFYING_WIDOW = 'qualifying_widow',
}

const FilingStatusSchema = Schema.Enums(FilingStatus)

// General Information Schema
const GeneralInformationSchema = Schema.Struct({
  firstName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('first_name'),
  ),
  lastName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('last_name'),
  ),
  email: Schema.String,
  phonePersonal: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('phone_personal'),
  ),
  dateOfBirth: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('date_of_birth'),
  ),
  ssn: Schema.String,
})

export type GeneralInformation = typeof GeneralInformationSchema.Type

// Profile Details Schema
const ProfileDetailsSchema = Schema.Struct({
  workDescription: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('work_description'),
  ),
  filingStatus: pipe(
    Schema.propertySignature(Schema.NullishOr(FilingStatusSchema)),
    Schema.fromKey('filing_status'),
  ),
  usState: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('us_state'),
  ),
  canadianProvince: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('canadian_province'),
  ),
})

export type ProfileDetails = typeof ProfileDetailsSchema.Type

// Tax Profile Schema
const TaxProfileSchema = Schema.Struct({
  generalInformation: pipe(
    Schema.propertySignature(GeneralInformationSchema),
    Schema.fromKey('general_information'),
  ),
  profile: ProfileDetailsSchema,
})

export type TaxProfile = typeof TaxProfileSchema.Type

export const TaxProfileResponseSchema = Schema.Struct({
  data: TaxProfileSchema,
})

export type TaxProfileResponse = typeof TaxProfileResponseSchema.Type

// Export URL Schema
const ExportUrlSchema = Schema.Struct({
  url: Schema.String,
  expiresAt: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('expires_at'),
  ),
})

export type ExportUrl = typeof ExportUrlSchema.Type

export const ExportTaxDocumentsResponseSchema = Schema.Struct({
  data: ExportUrlSchema,
})

export type ExportTaxDocumentsResponse = typeof ExportTaxDocumentsResponseSchema.Type

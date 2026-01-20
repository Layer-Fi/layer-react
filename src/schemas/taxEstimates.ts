import { pipe, Schema } from 'effect'

export enum FilingStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  MARRIED_SEPARATELY = 'MARRIED_SEPARATELY',
  HEAD = 'HEAD',
  WIDOWER = 'WIDOWER',
}

const FilingStatusSchema = Schema.Enums(FilingStatus)

export type TaxReportingBasis = 'ACCRUAL' | 'CASH'

export enum TaxExportType {
  TAX_PACKET = 'TAX_PACKET',
  SCHEDULE_C = 'SCHEDULE_C',
  PAYMENT_HISTORY = 'PAYMENT_HISTORY',
}

export enum ChecklistItemType {
  UNCATEGORIZED_DEDUCTIONS = 'UNCATEGORIZED_DEDUCTIONS',
  UNCATEGORIZED_DEPOSITS = 'UNCATEGORIZED_DEPOSITS',
  MISSING_PROFILE = 'MISSING_PROFILE',
}

const ChecklistItemTypeSchema = Schema.Enums(ChecklistItemType)

const TaxChecklistItemSchema = Schema.Struct({
  type: ChecklistItemTypeSchema,
  description: Schema.String,
  amount: Schema.NullishOr(Schema.Number),
  count: Schema.NullishOr(Schema.Number),
  actionUrl: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('action_url'),
  ),
})

export type TaxChecklistItem = typeof TaxChecklistItemSchema.Type

const ApiTaxChecklistSchema = Schema.Struct({
  type: Schema.String,
  year: Schema.Number,
  items: Schema.Array(TaxChecklistItemSchema),
})

export type ApiTaxChecklist = typeof ApiTaxChecklistSchema.Type

export const TaxChecklistResponseSchema = Schema.Struct({
  data: ApiTaxChecklistSchema,
})

export type TaxChecklistResponse = typeof TaxChecklistResponseSchema.Type

const TaxPaymentQuarterSchema = Schema.Struct({
  quarter: Schema.Number,
  owedRolledOverFromPrevious: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('owed_rolled_over_from_previous'),
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

export type TaxPaymentQuarter = typeof TaxPaymentQuarterSchema.Type

const ApiTaxPaymentsSchema = Schema.Struct({
  type: Schema.String,
  year: Schema.Number,
  quarters: Schema.Array(TaxPaymentQuarterSchema),
})

export type ApiTaxPayments = typeof ApiTaxPaymentsSchema.Type

export const TaxPaymentsResponseSchema = Schema.Struct({
  data: ApiTaxPaymentsSchema,
})

export type TaxPaymentsResponse = typeof TaxPaymentsResponseSchema.Type

const ApiTaxOverviewSchema = Schema.Struct({
  type: Schema.String,
  year: Schema.Number,
  excludesPendingTransactions: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('excludes_pending_transactions'),
  ),
  taxableIncomeEstimate: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxable_income_estimate'),
  ),
  totalIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_income'),
  ),
  totalDeductions: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_deductions'),
  ),
  estimatedTaxesOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('estimated_taxes_owed'),
  ),
  taxesDueDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('taxes_due_date'),
  ),
})

export type ApiTaxOverview = typeof ApiTaxOverviewSchema.Type

export const TaxOverviewResponseSchema = Schema.Struct({
  data: ApiTaxOverviewSchema,
})

export type TaxOverviewResponse = typeof TaxOverviewResponseSchema.Type

const ApiQuarterFederalTaxSchema = Schema.Struct({
  dueDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('due_date'),
  ),
  owed: Schema.Number,
  paid: Schema.Number,
  balance: Schema.Number,
})

export type ApiQuarterFederalTax = typeof ApiQuarterFederalTaxSchema.Type

const ApiQuarterEstimateSchema = Schema.Struct({
  usFederal: pipe(
    Schema.propertySignature(Schema.NullishOr(ApiQuarterFederalTaxSchema)),
    Schema.fromKey('us_federal'),
  ),
})

export type ApiQuarterEstimate = typeof ApiQuarterEstimateSchema.Type

const ApiQuarterlyEstimatesSchema = Schema.Struct({
  q1: Schema.NullishOr(ApiQuarterEstimateSchema),
  q2: Schema.NullishOr(ApiQuarterEstimateSchema),
  q3: Schema.NullishOr(ApiQuarterEstimateSchema),
  q4: Schema.NullishOr(ApiQuarterEstimateSchema),
})

export type ApiQuarterlyEstimates = typeof ApiQuarterlyEstimatesSchema.Type

const ApiVehicleExpenseSchema = Schema.Struct({
  method: Schema.String,
  amount: Schema.Number,
})

export type ApiVehicleExpense = typeof ApiVehicleExpenseSchema.Type

const ApiHomeOfficeSchema = Schema.Struct({
  method: Schema.String,
  amount: Schema.Number,
})

export type ApiHomeOffice = typeof ApiHomeOfficeSchema.Type

const ApiDeductionsSchema = Schema.Struct({
  businessExpenses: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('business_expenses'),
  ),
  vehicleExpense: pipe(
    Schema.propertySignature(Schema.NullishOr(ApiVehicleExpenseSchema)),
    Schema.fromKey('vehicle_expense'),
  ),
  homeOffice: pipe(
    Schema.propertySignature(Schema.NullishOr(ApiHomeOfficeSchema)),
    Schema.fromKey('home_office'),
  ),
  qualifiedTipDeduction: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('qualified_tip_deduction'),
  ),
  qualifiedOvertimeDeduction: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('qualified_overtime_deduction'),
  ),
  selfEmploymentTaxDeduction: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('self_employment_tax_deduction'),
  ),
  total: Schema.Number,
})

export type ApiDeductions = typeof ApiDeductionsSchema.Type

const ApiIncomeSchema = Schema.Struct({
  w2Income: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('w2_income'),
  ),
  w2Withholding: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('w2_withholding'),
  ),
  businessRevenue: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('business_revenue'),
  ),
  total: Schema.Number,
})

export type ApiIncome = typeof ApiIncomeSchema.Type

const ApiAdjustedGrossIncomeSchema = Schema.Struct({
  income: ApiIncomeSchema,
  deductions: ApiDeductionsSchema,
  totalAdjustedGrossIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_adjusted_gross_income'),
  ),
})

export type ApiAdjustedGrossIncome = typeof ApiAdjustedGrossIncomeSchema.Type

const ApiMedicareSurtaxSchema = Schema.Struct({
  medicareSurtaxIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('medicare_surtax_income'),
  ),
  medicareSurtaxRate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('medicare_surtax_rate'),
  ),
  medicareSurtaxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('medicare_surtax_owed'),
  ),
})

export type ApiMedicareSurtax = typeof ApiMedicareSurtaxSchema.Type

const ApiMedicareTaxSchema = Schema.Struct({
  medicareIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('medicare_income'),
  ),
  medicareTaxRate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('medicare_tax_rate'),
  ),
  medicareTaxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('medicare_tax_owed'),
  ),
})

export type ApiMedicareTax = typeof ApiMedicareTaxSchema.Type

const ApiSocialSecurityTaxSchema = Schema.Struct({
  socialSecurityIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('social_security_income'),
  ),
  socialSecurityTaxRate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('social_security_tax_rate'),
  ),
  socialSecurityTaxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('social_security_tax_owed'),
  ),
})

export type ApiSocialSecurityTax = typeof ApiSocialSecurityTaxSchema.Type

const ApiFederalIncomeTaxSchema = Schema.Struct({
  federalDeductions: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('federal_deductions'),
  ),
  qualifiedBusinessIncomeDeduction: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('qualified_business_income_deduction'),
  ),
  qbiEffectiveRate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('qbi_effective_rate'),
  ),
  taxableIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxable_income'),
  ),
  effectiveFederalTaxRate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('effective_federal_tax_rate'),
  ),
  federalIncomeTaxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('federal_income_tax_owed'),
  ),
})

export type ApiFederalIncomeTax = typeof ApiFederalIncomeTaxSchema.Type

const ApiTotalFederalTaxSchema = Schema.Struct({
  federalIncomeTaxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('federal_income_tax_owed'),
  ),
  socialSecurityTaxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('social_security_tax_owed'),
  ),
  medicareTaxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('medicare_tax_owed'),
  ),
  medicareSurtaxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('medicare_surtax_owed'),
  ),
  w2Withholdings: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('w2_withholdings'),
  ),
  totalFederalTaxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_federal_tax_owed'),
  ),
})

export type ApiTotalFederalTax = typeof ApiTotalFederalTaxSchema.Type

const ApiUsFederalTaxSchema = Schema.Struct({
  federalIncomeTax: pipe(
    Schema.propertySignature(ApiFederalIncomeTaxSchema),
    Schema.fromKey('federal_income_tax'),
  ),
  socialSecurityTax: pipe(
    Schema.propertySignature(ApiSocialSecurityTaxSchema),
    Schema.fromKey('social_security_tax'),
  ),
  medicareTax: pipe(
    Schema.propertySignature(ApiMedicareTaxSchema),
    Schema.fromKey('medicare_tax'),
  ),
  medicareSurtax: pipe(
    Schema.propertySignature(ApiMedicareSurtaxSchema),
    Schema.fromKey('medicare_surtax'),
  ),
  totalFederalTax: pipe(
    Schema.propertySignature(ApiTotalFederalTaxSchema),
    Schema.fromKey('total_federal_tax'),
  ),
})

export type ApiUsFederalTax = typeof ApiUsFederalTaxSchema.Type

const ApiTaxesSchema = Schema.Struct({
  usFederal: pipe(
    Schema.propertySignature(ApiUsFederalTaxSchema),
    Schema.fromKey('us_federal'),
  ),
})

export type ApiTaxes = typeof ApiTaxesSchema.Type

const ApiTaxDetailsSchema = Schema.Struct({
  type: Schema.String,
  year: Schema.Number,
  filingStatus: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('filing_status'),
  ),
  adjustedGrossIncome: pipe(
    Schema.propertySignature(ApiAdjustedGrossIncomeSchema),
    Schema.fromKey('adjusted_gross_income'),
  ),
  taxes: ApiTaxesSchema,
  quarterlyEstimates: pipe(
    Schema.propertySignature(ApiQuarterlyEstimatesSchema),
    Schema.fromKey('quarterly_estimates'),
  ),
})

export type ApiTaxDetails = typeof ApiTaxDetailsSchema.Type

export const TaxDetailsResponseSchema = Schema.Struct({
  data: ApiTaxDetailsSchema,
})

export type TaxDetailsResponse = typeof TaxDetailsResponseSchema.Type

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
  type: Schema.String,
  country: Schema.NullishOr(Schema.String),
  state: Schema.NullishOr(Schema.String),
  year: Schema.Number,
  usEstimates: UsTaxEstimatesSchema,
  caEstimates: Schema.NullishOr(Schema.Struct({})),
})

export type ApiTaxEstimates = typeof ApiTaxEstimatesSchema.Type

export const TaxEstimateResponseSchema = Schema.Struct({
  data: ApiTaxEstimatesSchema,
})

export type TaxEstimateResponse = typeof TaxEstimateResponseSchema.Type

const ApiTaxProfileUsConfigurationFederalSchema = Schema.Struct({
  filingStatus: pipe(
    Schema.propertySignature(Schema.NullishOr(FilingStatusSchema)),
    Schema.fromKey('filing_status'),
  ),
  annualW2Income: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('annual_w2_income'),
  ),
  tipIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('tip_income'),
  ),
  overtimeIncome: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('overtime_income'),
  ),
  withholding: Schema.NullishOr(Schema.Struct({
    useCustomWithholding: pipe(
      Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
      Schema.fromKey('use_custom_withholding'),
    ),
    amount: Schema.NullishOr(Schema.Number),
  })),
})

const ApiTaxProfileUsConfigurationStateSchema = Schema.Struct({
  taxState: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('tax_state'),
  ),
  filingStatus: pipe(
    Schema.propertySignature(Schema.NullishOr(FilingStatusSchema)),
    Schema.fromKey('filing_status'),
  ),
  numExemptions: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('num_exemptions'),
  ),
  withholding: Schema.NullishOr(Schema.Struct({
    useCustomWithholding: pipe(
      Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
      Schema.fromKey('use_custom_withholding'),
    ),
    amount: Schema.NullishOr(Schema.Number),
  })),
})

const ApiTaxProfileUsConfigurationSchema = Schema.Struct({
  federal: Schema.NullishOr(ApiTaxProfileUsConfigurationFederalSchema),
  state: Schema.NullishOr(ApiTaxProfileUsConfigurationStateSchema),
  deductions: Schema.NullishOr(Schema.Struct({
    homeOffice: Schema.NullishOr(Schema.Struct({
      useHomeOfficeDeduction: pipe(
        Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
        Schema.fromKey('use_home_office_deduction'),
      ),
      homeOfficeArea: pipe(
        Schema.propertySignature(Schema.NullishOr(Schema.Number)),
        Schema.fromKey('home_office_area'),
      ),
    })),
    vehicle: Schema.NullishOr(Schema.Struct({
      useMileageDeduction: pipe(
        Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
        Schema.fromKey('use_mileage_deduction'),
      ),
      vehicleBusinessPercent: pipe(
        Schema.propertySignature(Schema.NullishOr(Schema.Number)),
        Schema.fromKey('vehicle_business_percent'),
      ),
      mileage: Schema.NullishOr(Schema.Struct({
        useUserEstimatedBusinessMileage: pipe(
          Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
          Schema.fromKey('use_user_estimated_business_mileage'),
        ),
        userEstimatedBusinessMileage: pipe(
          Schema.propertySignature(Schema.NullishOr(Schema.Number)),
          Schema.fromKey('user_estimated_business_mileage'),
        ),
      })),
    })),
  })),
  businessEstimates: Schema.NullishOr(Schema.Struct({
    expenses: Schema.NullishOr(Schema.Struct({
      useUserEstimatedExpenses: pipe(
        Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
        Schema.fromKey('use_user_estimated_expenses'),
      ),
      userEstimatedExpenses: pipe(
        Schema.propertySignature(Schema.NullishOr(Schema.Number)),
        Schema.fromKey('user_estimated_expenses'),
      ),
    })),
  })),
})

const ApiTaxProfileSchema = Schema.Struct({
  type: Schema.String,
  taxCountryCode: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('tax_country_code'),
  ),
  usConfiguration: pipe(
    Schema.propertySignature(Schema.NullishOr(ApiTaxProfileUsConfigurationSchema)),
    Schema.fromKey('us_configuration'),
  ),
})

export type ApiTaxProfile = typeof ApiTaxProfileSchema.Type

export const TaxProfileResponseSchema = Schema.Struct({
  data: ApiTaxProfileSchema,
})

export type TaxProfileResponse = typeof TaxProfileResponseSchema.Type

const S3PresignedUrlSchema = Schema.Struct({
  type: Schema.String,
  presignedUrl: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('presignedUrl'),
  ),
  fileType: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('fileType'),
  ),
})

export type S3PresignedUrl = typeof S3PresignedUrlSchema.Type

export const ExportTaxDocumentsResponseSchema = Schema.Struct({
  data: S3PresignedUrlSchema,
})

export type ExportTaxDocumentsResponse = typeof ExportTaxDocumentsResponseSchema.Type

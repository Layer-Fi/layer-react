import { pipe, Schema } from 'effect'

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
    Schema.propertySignature(Schema.NullishOr(ApiMedicareSurtaxSchema)),
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
    Schema.propertySignature(Schema.NullishOr(ApiUsFederalTaxSchema)),
    Schema.fromKey('us_federal'),
  ),
})

export type ApiTaxes = typeof ApiTaxesSchema.Type

const ApiTaxDetailsSchema = Schema.Struct({
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

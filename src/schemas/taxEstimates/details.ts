import { pipe, Schema } from 'effect'

const VehicleExpenseSchema = Schema.Struct({
  method: Schema.String,
  amount: Schema.Number,
})

export type VehicleExpense = typeof VehicleExpenseSchema.Type

const HomeOfficeSchema = Schema.Struct({
  method: Schema.String,
  amount: Schema.Number,
})

export type HomeOffice = typeof HomeOfficeSchema.Type

const DeductionsSchema = Schema.Struct({
  businessExpenses: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('business_expenses'),
  ),
  vehicleExpense: pipe(
    Schema.propertySignature(Schema.NullishOr(VehicleExpenseSchema)),
    Schema.fromKey('vehicle_expense'),
  ),
  homeOffice: pipe(
    Schema.propertySignature(Schema.NullishOr(HomeOfficeSchema)),
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

export type Deductions = typeof DeductionsSchema.Type

const IncomeSchema = Schema.Struct({
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

export type Income = typeof IncomeSchema.Type

const AdjustedGrossIncomeSchema = Schema.Struct({
  income: IncomeSchema,
  deductions: DeductionsSchema,
  totalAdjustedGrossIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_adjusted_gross_income'),
  ),
})

export type AdjustedGrossIncome = typeof AdjustedGrossIncomeSchema.Type

const MedicareSurtaxSchema = Schema.Struct({
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

export type MedicareSurtax = typeof MedicareSurtaxSchema.Type

const MedicareTaxSchema = Schema.Struct({
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

export type MedicareTax = typeof MedicareTaxSchema.Type

const SocialSecurityTaxSchema = Schema.Struct({
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

export type SocialSecurityTax = typeof SocialSecurityTaxSchema.Type

const FederalIncomeTaxSchema = Schema.Struct({
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

export type FederalIncomeTax = typeof FederalIncomeTaxSchema.Type

const TotalFederalTaxSchema = Schema.Struct({
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

export type TotalFederalTax = typeof TotalFederalTaxSchema.Type

const UsFederalTaxSchema = Schema.Struct({
  federalIncomeTax: pipe(
    Schema.propertySignature(FederalIncomeTaxSchema),
    Schema.fromKey('federal_income_tax'),
  ),
  socialSecurityTax: pipe(
    Schema.propertySignature(SocialSecurityTaxSchema),
    Schema.fromKey('social_security_tax'),
  ),
  medicareTax: pipe(
    Schema.propertySignature(MedicareTaxSchema),
    Schema.fromKey('medicare_tax'),
  ),
  medicareSurtax: pipe(
    Schema.propertySignature(Schema.NullishOr(MedicareSurtaxSchema)),
    Schema.fromKey('medicare_surtax'),
  ),
  totalFederalTax: pipe(
    Schema.propertySignature(TotalFederalTaxSchema),
    Schema.fromKey('total_federal_tax'),
  ),
})

export type UsFederalTax = typeof UsFederalTaxSchema.Type

const StateIncomeTaxSchema = Schema.Struct({
  stateAgi: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('state_agi'),
  ),
  stateDeductions: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('state_deductions'),
  ),
  stateTaxableIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('state_taxable_income'),
  ),
  effectiveStateTaxRate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('effective_state_tax_rate'),
  ),
  stateIncomeTaxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('state_income_tax_owed'),
  ),
})

export type StateIncomeTax = typeof StateIncomeTaxSchema.Type

const StateAdditionalTaxSchema = Schema.Struct({
  taxName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('tax_name'),
  ),
  taxRate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('tax_rate'),
  ),
  taxableAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxable_amount'),
  ),
  taxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('tax_owed'),
  ),
})

export type StateAdditionalTax = typeof StateAdditionalTaxSchema.Type

const TotalStateTaxSchema = Schema.Struct({
  stateIncomeTaxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('state_income_tax_owed'),
  ),
  additionalTaxesOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('additional_taxes_owed'),
  ),
  stateWithholdings: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('state_withholdings'),
  ),
  totalStateTaxOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_state_tax_owed'),
  ),
})

export type TotalStateTax = typeof TotalStateTaxSchema.Type

const UsStateTaxSchema = Schema.Struct({
  stateCode: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('state_code'),
  ),
  stateName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('state_name'),
  ),
  filingStatus: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('filing_status'),
  ),
  stateIncomeTax: pipe(
    Schema.propertySignature(StateIncomeTaxSchema),
    Schema.fromKey('state_income_tax'),
  ),
  additionalTaxes: pipe(
    Schema.propertySignature(Schema.Array(StateAdditionalTaxSchema)),
    Schema.fromKey('additional_taxes'),
  ),
  totalStateTax: pipe(
    Schema.propertySignature(TotalStateTaxSchema),
    Schema.fromKey('total_state_tax'),
  ),
})

export type UsStateTax = typeof UsStateTaxSchema.Type

const TaxesSchema = Schema.Struct({
  usFederal: pipe(
    Schema.propertySignature(Schema.NullishOr(UsFederalTaxSchema)),
    Schema.fromKey('us_federal'),
  ),
  usState: pipe(
    Schema.propertySignature(Schema.NullishOr(UsStateTaxSchema)),
    Schema.fromKey('us_state'),
  ),
})

export type Taxes = typeof TaxesSchema.Type

const QuarterFederalTaxSchema = Schema.Struct({
  dueDate: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('due_date'),
  ),
  owed: Schema.Number,
  paid: Schema.Number,
  balance: Schema.Number,
})

export type QuarterFederalTax = typeof QuarterFederalTaxSchema.Type

const QuarterStateTaxSchema = Schema.Struct({
  stateCode: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('state_code'),
  ),
  dueDate: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('due_date'),
  ),
  owed: Schema.Number,
  paid: Schema.Number,
  balance: Schema.Number,
})

export type QuarterStateTax = typeof QuarterStateTaxSchema.Type

const QuarterEstimateSchema = Schema.Struct({
  usFederal: pipe(
    Schema.propertySignature(Schema.NullishOr(QuarterFederalTaxSchema)),
    Schema.fromKey('us_federal'),
  ),
  usState: pipe(
    Schema.propertySignature(Schema.NullishOr(QuarterStateTaxSchema)),
    Schema.fromKey('us_state'),
  ),
})

export type QuarterEstimate = typeof QuarterEstimateSchema.Type

const QuarterlyEstimatesSchema = Schema.Struct({
  q1: pipe(
    Schema.propertySignature(Schema.NullishOr(QuarterEstimateSchema)),
    Schema.fromKey('q1'),
  ),
  q2: pipe(
    Schema.propertySignature(Schema.NullishOr(QuarterEstimateSchema)),
    Schema.fromKey('q2'),
  ),
  q3: pipe(
    Schema.propertySignature(Schema.NullishOr(QuarterEstimateSchema)),
    Schema.fromKey('q3'),
  ),
  q4: pipe(
    Schema.propertySignature(Schema.NullishOr(QuarterEstimateSchema)),
    Schema.fromKey('q4'),
  ),
})

export type QuarterlyEstimates = typeof QuarterlyEstimatesSchema.Type

const TaxDetailsSchema = Schema.Struct({
  year: Schema.Number,
  filingStatus: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('filing_status'),
  ),
  adjustedGrossIncome: pipe(
    Schema.propertySignature(AdjustedGrossIncomeSchema),
    Schema.fromKey('adjusted_gross_income'),
  ),
  taxes: TaxesSchema,
  quarterlyEstimates: pipe(
    Schema.propertySignature(Schema.NullishOr(QuarterlyEstimatesSchema)),
    Schema.fromKey('quarterly_estimates'),
  ),
})

export type TaxDetails = typeof TaxDetailsSchema.Type

export const TaxDetailsResponseSchema = Schema.Struct({
  data: TaxDetailsSchema,
})

export type TaxDetailsResponse = typeof TaxDetailsResponseSchema.Type

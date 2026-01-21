import { pipe, Schema } from 'effect'

import { US_STATES } from '@internal-types/location'
import { FilingStatusSchema } from '@schemas/taxEstimates/filingStatus'

const USStateCodeSchema = Schema.Literal(...US_STATES.map(s => s.value))

const WithholdingSchema = Schema.Struct({
  useCustomWithholding: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
    Schema.fromKey('use_custom_withholding'),
  ),
  amount: Schema.NullishOr(Schema.Number),
})

const HomeOfficeDeductionSchema = Schema.Struct({
  useHomeOfficeDeduction: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
    Schema.fromKey('use_home_office_deduction'),
  ),
  homeOfficeArea: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('home_office_area'),
  ),
})

const VehicleDeductionSchema = Schema.Struct({
  useMileageDeduction: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
    Schema.fromKey('use_mileage_deduction'),
  ),
})

const DeductionsSchema = Schema.Struct({
  homeOffice: pipe(
    Schema.propertySignature(Schema.NullishOr(HomeOfficeDeductionSchema)),
    Schema.fromKey('home_office'),
  ),
  vehicle: Schema.NullishOr(VehicleDeductionSchema),
})

const FederalConfigurationSchema = Schema.Struct({
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
  withholding: Schema.NullishOr(WithholdingSchema),
})

const StateConfigurationSchema = Schema.Struct({
  taxState: pipe(
    Schema.propertySignature(Schema.NullishOr(USStateCodeSchema)),
    Schema.fromKey('tax_state'),
  ),
  filingStatus: pipe(
    Schema.propertySignature(Schema.NullishOr(FilingStatusSchema)),
    Schema.fromKey('filing_status'),
  ),
  withholding: Schema.NullishOr(WithholdingSchema),
})

const UsConfigurationSchema = Schema.Struct({
  federal: Schema.NullishOr(FederalConfigurationSchema),
  state: Schema.NullishOr(StateConfigurationSchema),
  deductions: pipe(
    Schema.propertySignature(Schema.NullishOr(DeductionsSchema)),
    Schema.fromKey('deductions'),
  ),
})

export const TaxProfileSchema = Schema.Struct({
  taxCountryCode: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('tax_country_code'),
  ),
  usConfiguration: pipe(
    Schema.propertySignature(Schema.NullishOr(UsConfigurationSchema)),
    Schema.fromKey('us_configuration'),
  ),
  userHasSavedTaxProfile: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('user_has_saved_tax_profile'),
  ),
})

export type TaxProfile = typeof TaxProfileSchema.Type

export const TaxProfileResponseSchema = Schema.Struct({
  data: TaxProfileSchema,
})

export type TaxProfileResponse = typeof TaxProfileResponseSchema.Type

export const TaxProfileRequestSchema = Schema.Struct({
  taxCountryCode: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('tax_country_code'),
  ),
  usConfiguration: pipe(
    Schema.propertySignature(Schema.NullishOr(UsConfigurationSchema)),
    Schema.fromKey('us_configuration'),
  ),
})

export type TaxProfileRequest = typeof TaxProfileRequestSchema.Encoded

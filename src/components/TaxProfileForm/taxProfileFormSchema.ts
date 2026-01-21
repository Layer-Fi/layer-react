import { Schema } from 'effect'

import type { USStateCode } from '@internal-types/location'
import type { FilingStatus } from '@schemas/taxEstimates/filingStatus'

const WithholdingFormSchema = Schema.Struct({
  useCustomWithholding: Schema.NullishOr(Schema.Boolean),
  amount: Schema.NullishOr(Schema.BigDecimal),
})
const HomeOfficeDeductionFormSchema = Schema.Struct({
  useHomeOfficeDeduction: Schema.NullishOr(Schema.Boolean),
  homeOfficeArea: Schema.NullishOr(Schema.BigDecimal),
})
const VehicleDeductionFormSchema = Schema.Struct({
  useMileageDeduction: Schema.NullishOr(Schema.Boolean),
})
const DeductionsFormSchema = Schema.Struct({
  homeOffice: Schema.NullishOr(HomeOfficeDeductionFormSchema),
  vehicle: Schema.NullishOr(VehicleDeductionFormSchema),
})
const FederalConfigurationFormSchema = Schema.Struct({
  filingStatus: Schema.NullishOr(Schema.String) as Schema.Schema<FilingStatus | null | undefined>,
  annualW2Income: Schema.NullishOr(Schema.BigDecimal),
  tipIncome: Schema.NullishOr(Schema.BigDecimal),
  overtimeIncome: Schema.NullishOr(Schema.BigDecimal),
  withholding: Schema.NullishOr(WithholdingFormSchema),
})
const StateConfigurationFormSchema = Schema.Struct({
  taxState: Schema.NullishOr(Schema.String) as Schema.Schema<USStateCode | null | undefined>,
  filingStatus: Schema.NullishOr(Schema.String) as Schema.Schema<FilingStatus | null | undefined>,
  numExemptions: Schema.NullishOr(Schema.Number),
  withholding: Schema.NullishOr(WithholdingFormSchema),
})
const UsConfigurationFormSchema = Schema.Struct({
  federal: Schema.NullishOr(FederalConfigurationFormSchema),
  state: Schema.NullishOr(StateConfigurationFormSchema),
  deductions: Schema.NullishOr(DeductionsFormSchema),
})

export const TaxProfileFormSchema = Schema.Struct({
  taxCountryCode: Schema.NullishOr(Schema.String),
  usConfiguration: Schema.NullishOr(UsConfigurationFormSchema),
})

export type TaxProfileForm = typeof TaxProfileFormSchema.Type

import { pipe, Schema } from 'effect'

import { FilingStatusSchema } from './taxEstimatesCommon'

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
  deductions: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Struct({
      homeOffice: pipe(
        Schema.propertySignature(Schema.NullishOr(Schema.Struct({
          useHomeOfficeDeduction: pipe(
            Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
            Schema.fromKey('use_home_office_deduction'),
          ),
          homeOfficeArea: pipe(
            Schema.propertySignature(Schema.NullishOr(Schema.Number)),
            Schema.fromKey('home_office_area'),
          ),
        }))),
        Schema.fromKey('home_office'),
      ),
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
    }))),
    Schema.fromKey('deductions'),
  ),
  businessEstimates: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Struct({
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
    }))),
    Schema.fromKey('business_estimates'),
  ),
})

const ApiTaxProfileSchema = Schema.Struct({
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

const TaxProfileInputUsConfigurationFederalSchema = Schema.Struct({
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

const TaxProfileInputUsConfigurationStateSchema = Schema.Struct({
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

const TaxProfileInputUsConfigurationSchema = Schema.Struct({
  federal: Schema.NullishOr(TaxProfileInputUsConfigurationFederalSchema),
  state: Schema.NullishOr(TaxProfileInputUsConfigurationStateSchema),
  deductions: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Struct({
      homeOffice: pipe(
        Schema.propertySignature(Schema.NullishOr(Schema.Struct({
          useHomeOfficeDeduction: pipe(
            Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
            Schema.fromKey('use_home_office_deduction'),
          ),
          homeOfficeArea: pipe(
            Schema.propertySignature(Schema.NullishOr(Schema.Number)),
            Schema.fromKey('home_office_area'),
          ),
        }))),
        Schema.fromKey('home_office'),
      ),
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
    }))),
    Schema.fromKey('deductions'),
  ),
  businessEstimates: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Struct({
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
    }))),
    Schema.fromKey('business_estimates'),
  ),
})

export const TaxProfileInputSchema = Schema.Struct({
  taxCountryCode: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('tax_country_code'),
  ),
  usConfiguration: pipe(
    Schema.propertySignature(Schema.NullishOr(TaxProfileInputUsConfigurationSchema)),
    Schema.fromKey('us_configuration'),
  ),
})

export type TaxProfileInput = typeof TaxProfileInputSchema.Encoded

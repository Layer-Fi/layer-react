import { type AccountingConfigurationSchemaType } from '@schemas/accountingConfiguration'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseAccountingConfiguration: AccountingConfigurationSchemaType = {
  id: '00000000-0000-4000-8000-000000000301',
  enableAccountNumbers: false,
  enableCustomerManagement: false,
  taxEstimatesUserAgreementAt: null,
  enableTaxEstimates: false,
  enableMileageTracking: false,
  enableStripeOnboarding: false,
  platformDisplayTags: [],
}

export const { make: makeAccountingConfiguration, makeMany: makeAccountingConfigurations } =
  createFixtureFactory(baseAccountingConfiguration)

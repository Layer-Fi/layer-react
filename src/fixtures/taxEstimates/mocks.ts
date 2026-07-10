import { type TaxProfile } from '@schemas/taxEstimates/profile'
import { type TaxSummary, TaxSummaryState } from '@schemas/taxEstimates/summary'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseTaxProfile: TaxProfile = {
  taxCountryCode: 'US',
  usConfiguration: null,
  userHasSavedTaxProfile: true,
}

export const { make: makeTaxProfile } = createFixtureFactory(baseTaxProfile)

export const makeTaxSummary = (year: number): TaxSummary => ({
  year,
  state: TaxSummaryState.TAXES_OWED,
  projectedTaxesOwed: 330000,
  taxesDueAt: new Date(year, 8, 15),
  uncategorizedTaxPayments: 0,
  sections: [
    {
      type: 'federal',
      key: 'federal',
      label: 'Federal',
      total: 890000,
      taxesPaid: 620000,
      taxesOwed: 270000,
    },
    {
      type: 'state',
      key: 'CA',
      label: 'California',
      total: 240000,
      taxesPaid: 180000,
      taxesOwed: 60000,
    },
  ],
})

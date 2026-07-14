import { type TaxProfile } from '@schemas/taxEstimates/profile'

import {
  deriveTaxBanner,
  deriveTaxDetails,
  deriveTaxOverview,
  deriveTaxPayments,
  deriveTaxSummary,
  makeTaxScenario,
} from '@fixtures/taxEstimates/scenario'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseTaxProfile: TaxProfile = {
  taxCountryCode: 'US',
  usConfiguration: null,
  userHasSavedTaxProfile: true,
}

export const { make: makeTaxProfile } = createFixtureFactory(baseTaxProfile)

export const makeTaxOverview = (year: number) => deriveTaxOverview(makeTaxScenario({ year }))
export const makeTaxSummary = (year: number) => deriveTaxSummary(makeTaxScenario({ year }))
export const makeTaxDetails = (year: number) => deriveTaxDetails(makeTaxScenario({ year }))
export const makeTaxPayments = (year: number) => deriveTaxPayments(makeTaxScenario({ year }))
export const makeTaxBanner = (year: number) => deriveTaxBanner(makeTaxScenario({ year }))

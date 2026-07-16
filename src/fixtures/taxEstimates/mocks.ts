import { FilingStatus } from '@schemas/taxEstimates/filingStatus'
import { type TaxProfile } from '@schemas/taxEstimates/profile'

import { makeTaxScenario } from '@fixtures/taxEstimates/scenario/constants'
import {
  deriveTaxBanner,
  deriveTaxDetails,
  deriveTaxOverview,
  deriveTaxPayments,
  deriveTaxSummary,
} from '@fixtures/taxEstimates/scenario/derive'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseTaxProfile: TaxProfile = {
  taxCountryCode: 'US',
  usConfiguration: {
    federal: {
      filingStatus: FilingStatus.SINGLE,
      annualW2Income: 3_000_000,
      tipIncome: 0,
      overtimeIncome: 0,
      withholding: { useCustomWithholding: false, amount: null },
    },
    state: {
      taxState: 'CA',
      filingStatus: FilingStatus.SINGLE,
      withholding: { useCustomWithholding: false, amount: null },
    },
    deductions: {
      homeOffice: { useHomeOfficeDeduction: true, homeOfficeArea: 150 },
      vehicle: { useMileageDeduction: true },
    },
  },
  userHasSavedTaxProfile: true,
}

export const { make: makeTaxProfile } = createFixtureFactory(baseTaxProfile)

export const makeTaxOverview = (year: number) => deriveTaxOverview(makeTaxScenario({ year }))
export const makeTaxSummary = (year: number) => deriveTaxSummary(makeTaxScenario({ year }))
export const makeTaxDetails = (year: number) => deriveTaxDetails(makeTaxScenario({ year }))
export const makeTaxPayments = (year: number) => deriveTaxPayments(makeTaxScenario({ year }))
export const makeTaxBanner = (year: number) => deriveTaxBanner(makeTaxScenario({ year }))

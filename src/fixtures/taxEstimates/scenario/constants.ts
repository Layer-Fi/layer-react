import { FilingStatus } from '@schemas/taxEstimates/filingStatus'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { type TaxScenario } from '@fixtures/taxEstimates/scenario/types'
import { scaleScenario, settleAllQuarters, yearFactor } from '@fixtures/taxEstimates/scenario/utils'

export const DEFAULT_SCENARIO: TaxScenario = {
  year: FIXTURE_YEAR,
  filingStatus: FilingStatus.SINGLE,
  stateCode: 'CA',
  stateLabel: 'California',
  income: [
    { rowKey: 'business-income', label: 'Business income', amount: 12_000_000 },
    { rowKey: 'w2-wages', label: 'W-2 wages', amount: 3_000_000, fixed: true },
  ],
  deductions: [
    { rowKey: 'se-tax-deduction', label: '½ self-employment tax', amount: 850_000 },
    { rowKey: 'qbi-deduction', label: 'Qualified business income deduction', amount: 2_000_000 },
    { rowKey: 'retirement', label: 'Retirement contributions', amount: 1_000_000 },
  ],
  quarters: [
    { quarter: 1, federalOwed: 700_000, stateOwed: 175_000, federalPaid: 700_000, statePaid: 175_000 },
    { quarter: 2, federalOwed: 700_000, stateOwed: 175_000, federalPaid: 700_000, statePaid: 175_000 },
    { quarter: 3, federalOwed: 700_000, stateOwed: 175_000, federalPaid: 700_000, statePaid: 175_000 },
    { quarter: 4, federalOwed: 700_000, stateOwed: 175_000, federalPaid: 0, statePaid: 0 },
  ],
  uncategorized: {
    count: 6,
    moneyIn: 420_000,
    moneyOut: 150_000,
  },
}

export const makeTaxScenario = (overrides: Partial<TaxScenario> = {}): TaxScenario => {
  const year = overrides.year ?? DEFAULT_SCENARIO.year
  const scaled = scaleScenario(structuredClone(DEFAULT_SCENARIO), yearFactor(year))
  const settled = year < new Date().getFullYear() ? settleAllQuarters(scaled) : scaled
  return { ...settled, ...overrides }
}

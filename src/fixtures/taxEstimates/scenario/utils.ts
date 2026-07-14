import { CalendarDate } from '@internationalized/date'
import { sum } from 'lodash-es'

import { type TaxDetailsValue } from '@schemas/taxEstimates/details'
import { TaxSummaryState } from '@schemas/taxEstimates/summary'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { type QuarterBalance, type TaxScenario } from '@fixtures/taxEstimates/scenario/types'

export const quarterDueDate = (year: number, quarter: number): CalendarDate => {
  switch (quarter) {
    case 1: return new CalendarDate(year, 4, 15)
    case 2: return new CalendarDate(year, 6, 15)
    case 3: return new CalendarDate(year, 9, 15)
    default: return new CalendarDate(year + 1, 1, 15)
  }
}

export const annualDueDate = (year: number) => new CalendarDate(year + 1, 4, 15)

export const totalIncome = (scenario: TaxScenario) => sum(scenario.income.map(item => item.amount))
export const totalDeductions = (scenario: TaxScenario) => sum(scenario.deductions.map(item => item.amount))
export const taxableIncome = (scenario: TaxScenario) => totalIncome(scenario) - totalDeductions(scenario)

export const federalTotal = (scenario: TaxScenario) => sum(scenario.quarters.map(q => q.federalOwed))
export const stateTotal = (scenario: TaxScenario) => sum(scenario.quarters.map(q => q.stateOwed))
export const federalPaid = (scenario: TaxScenario) => sum(scenario.quarters.map(q => q.federalPaid))
export const statePaid = (scenario: TaxScenario) => sum(scenario.quarters.map(q => q.statePaid))

export const federalOwedRemaining = (scenario: TaxScenario) => federalTotal(scenario) - federalPaid(scenario)
export const stateOwedRemaining = (scenario: TaxScenario) => stateTotal(scenario) - statePaid(scenario)
export const projectedTaxesOwed = (scenario: TaxScenario) => federalOwedRemaining(scenario) + stateOwedRemaining(scenario)

export const summaryState = (scenario: TaxScenario): TaxSummaryState => {
  if (totalIncome(scenario) === 0) return TaxSummaryState.NO_TRANSACTIONS
  if (projectedTaxesOwed(scenario) <= 0) return TaxSummaryState.NO_TAXES_OWED
  return TaxSummaryState.TAXES_OWED
}

export const currency = (value: number): TaxDetailsValue => ({ type: 'Currency', value })
export const percentage = (value: number): TaxDetailsValue => ({ type: 'Percentage', value })

export const effectiveRate = (tax: number, base: number) => base > 0 ? tax / base : 0

export const runningBalances = (owed: number[], paid: number[]): QuarterBalance[] => {
  const balances: QuarterBalance[] = []
  let carried = 0
  owed.forEach((owedThisQuarter, index) => {
    const totalPaid = paid[index]
    const remainingBalance = carried + owedThisQuarter - totalPaid
    balances.push({ rolledOverFromPrevious: carried, owedThisQuarter, totalPaid, remainingBalance })
    carried = Math.max(remainingBalance, 0)
  })
  return balances
}

export const quarterLabel = (quarter: number) => `Q${quarter}`

export const rebaseToYear = (date: Date | null, year: number): Date | null =>
  date === null ? null : new Date(year, date.getMonth(), date.getDate())

const ANNUAL_GROWTH_RATE = 1.12

export const yearFactor = (year: number) => ANNUAL_GROWTH_RATE ** (year - FIXTURE_YEAR)

const scaleAmount = (amount: number, factor: number) => Math.round(amount * factor)

export const scaleScenario = (scenario: TaxScenario, factor: number): TaxScenario => ({
  ...scenario,
  income: scenario.income.map(item => item.fixed ? item : { ...item, amount: scaleAmount(item.amount, factor) }),
  deductions: scenario.deductions.map(item => ({ ...item, amount: scaleAmount(item.amount, factor) })),
  quarters: scenario.quarters.map(quarter => ({
    ...quarter,
    federalOwed: scaleAmount(quarter.federalOwed, factor),
    stateOwed: scaleAmount(quarter.stateOwed, factor),
    federalPaid: scaleAmount(quarter.federalPaid, factor),
    statePaid: scaleAmount(quarter.statePaid, factor),
  })),
  uncategorized: {
    ...scenario.uncategorized,
    moneyIn: scaleAmount(scenario.uncategorized.moneyIn, factor),
    moneyOut: scaleAmount(scenario.uncategorized.moneyOut, factor),
  },
})

export const settleAllQuarters = (scenario: TaxScenario): TaxScenario => ({
  ...scenario,
  quarters: scenario.quarters.map(quarter => ({
    ...quarter,
    federalPaid: quarter.federalOwed,
    statePaid: quarter.stateOwed,
  })),
})

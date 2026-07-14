import { CalendarDate } from '@internationalized/date'

import { type TaxEstimatesBanner, type TaxEstimatesBannerQuarter } from '@schemas/taxEstimates/banner'
import { type TaxDetails, type TaxDetailsRow, type TaxDetailsValue } from '@schemas/taxEstimates/details'
import { FilingStatus } from '@schemas/taxEstimates/filingStatus'
import { type TaxOverviewApiData, TaxOverviewDeadlineStatus, TaxOverviewMetricType } from '@schemas/taxEstimates/overview'
import { type TaxPaymentRow } from '@schemas/taxEstimates/payments'
import { type TaxSummary, TaxSummaryState } from '@schemas/taxEstimates/summary'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'

type LineItem = {
  rowKey: string
  label: string
  amount: number
}

type ScenarioQuarter = {
  quarter: number
  federalOwed: number
  stateOwed: number
  federalPaid: number
  statePaid: number
}

export type TaxScenario = {
  year: number
  filingStatus: FilingStatus
  stateCode: string
  stateLabel: string
  income: LineItem[]
  deductions: LineItem[]
  quarters: ScenarioQuarter[]
  uncategorized: {
    count: number
    moneyIn: number
    moneyOut: number
    earliestAt: Date | null
    latestAt: Date | null
  }
}

const DEFAULT_SCENARIO: TaxScenario = {
  year: FIXTURE_YEAR,
  filingStatus: FilingStatus.SINGLE,
  stateCode: 'CA',
  stateLabel: 'California',
  income: [
    { rowKey: 'business-income', label: 'Business income', amount: 12_000_000 },
    { rowKey: 'w2-wages', label: 'W-2 wages', amount: 3_000_000 },
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
  uncategorized: { count: 0, moneyIn: 0, moneyOut: 0, earliestAt: null, latestAt: null },
}

export const makeTaxScenario = (overrides: Partial<TaxScenario> = {}): TaxScenario => ({
  ...structuredClone(DEFAULT_SCENARIO),
  ...overrides,
})

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

const quarterDueDate = (year: number, quarter: number): CalendarDate => {
  switch (quarter) {
    case 1: return new CalendarDate(year, 4, 15)
    case 2: return new CalendarDate(year, 6, 15)
    case 3: return new CalendarDate(year, 9, 15)
    default: return new CalendarDate(year + 1, 1, 15)
  }
}

const annualDueDate = (year: number) => new CalendarDate(year + 1, 4, 15)

const totalIncome = (scenario: TaxScenario) => sum(scenario.income.map(item => item.amount))
const totalDeductions = (scenario: TaxScenario) => sum(scenario.deductions.map(item => item.amount))
const taxableIncome = (scenario: TaxScenario) => totalIncome(scenario) - totalDeductions(scenario)

const federalTotal = (scenario: TaxScenario) => sum(scenario.quarters.map(q => q.federalOwed))
const stateTotal = (scenario: TaxScenario) => sum(scenario.quarters.map(q => q.stateOwed))
const federalPaid = (scenario: TaxScenario) => sum(scenario.quarters.map(q => q.federalPaid))
const statePaid = (scenario: TaxScenario) => sum(scenario.quarters.map(q => q.statePaid))

const federalOwedRemaining = (scenario: TaxScenario) => federalTotal(scenario) - federalPaid(scenario)
const stateOwedRemaining = (scenario: TaxScenario) => stateTotal(scenario) - statePaid(scenario)
const projectedTaxesOwed = (scenario: TaxScenario) => federalOwedRemaining(scenario) + stateOwedRemaining(scenario)

const summaryState = (scenario: TaxScenario): TaxSummaryState => {
  if (totalIncome(scenario) === 0) return TaxSummaryState.NO_TRANSACTIONS
  if (projectedTaxesOwed(scenario) <= 0) return TaxSummaryState.NO_TAXES_OWED
  return TaxSummaryState.TAXES_OWED
}

export const deriveTaxOverview = (scenario: TaxScenario): TaxOverviewApiData => {
  const income = totalIncome(scenario)
  return {
    year: scenario.year,
    metrics: [
      { metricType: TaxOverviewMetricType.TotalIncome, label: 'Total income', value: income, maxValue: income },
      { metricType: TaxOverviewMetricType.TotalPreAgiDeductions, label: 'Pre-AGI deductions', value: totalDeductions(scenario), maxValue: income },
      { metricType: TaxOverviewMetricType.TaxableIncome, label: 'Taxable income', value: taxableIncome(scenario), maxValue: income },
    ],
  }
}

export const deriveTaxSummary = (scenario: TaxScenario): TaxSummary => ({
  year: scenario.year,
  state: summaryState(scenario),
  projectedTaxesOwed: projectedTaxesOwed(scenario),
  taxesDueAt: new Date(scenario.year + 1, 3, 15),
  uncategorizedTaxPayments: 0,
  sections: [
    {
      type: 'federal',
      key: 'federal',
      label: 'Federal',
      total: federalTotal(scenario),
      taxesPaid: federalPaid(scenario),
      taxesOwed: federalOwedRemaining(scenario),
    },
    {
      type: 'state',
      key: scenario.stateCode,
      label: scenario.stateLabel,
      total: stateTotal(scenario),
      taxesPaid: statePaid(scenario),
      taxesOwed: stateOwedRemaining(scenario),
    },
  ],
})

const currency = (value: number): TaxDetailsValue => ({ type: 'Currency', value })
const percentage = (value: number): TaxDetailsValue => ({ type: 'Percentage', value })

const effectiveRate = (tax: number, base: number) => base > 0 ? tax / base : 0

export const deriveTaxDetails = (scenario: TaxScenario): TaxDetails => {
  const taxable = taxableIncome(scenario)
  const federal = federalTotal(scenario)
  const state = stateTotal(scenario)

  const rows: TaxDetailsRow[] = [
    {
      rowKey: 'total-income',
      label: 'Total income',
      operator: '=',
      value: currency(totalIncome(scenario)),
      breakdown: scenario.income.map(item => ({ rowKey: item.rowKey, label: item.label, value: currency(item.amount) })),
    },
    {
      rowKey: 'pre-agi-deductions',
      label: 'Pre-AGI deductions',
      value: currency(totalDeductions(scenario)),
      breakdown: scenario.deductions.map(item => ({ rowKey: item.rowKey, label: item.label, value: currency(item.amount) })),
    },
    {
      rowKey: 'taxable-income',
      label: 'Taxable income',
      operator: '=',
      value: currency(taxable),
    },
    {
      rowKey: 'federal-tax',
      label: 'Federal tax',
      value: currency(federal),
      breakdown: [
        { rowKey: 'federal-rate', label: 'Effective federal rate', value: percentage(effectiveRate(federal, taxable)) },
      ],
    },
    {
      rowKey: 'state-tax',
      label: `${scenario.stateLabel} state tax`,
      value: currency(state),
      breakdown: [
        { rowKey: 'state-rate', label: 'Effective state rate', value: percentage(effectiveRate(state, taxable)) },
      ],
    },
    {
      rowKey: 'total-estimated-tax',
      label: 'Total estimated tax',
      operator: '=',
      value: currency(federal + state),
    },
  ]

  return {
    type: 'US_Tax_Details',
    meta: { year: scenario.year, state: summaryState(scenario), filingStatus: scenario.filingStatus },
    rows,
  }
}

type QuarterBalance = {
  rolledOverFromPrevious: number
  owedThisQuarter: number
  totalPaid: number
  remainingBalance: number
}

const runningBalances = (owed: number[], paid: number[]): QuarterBalance[] => {
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

const quarterLabel = (quarter: number) => `Q${quarter}`

export const deriveTaxPayments = (scenario: TaxScenario): { type: 'US_Tax_Payments', data: TaxPaymentRow[] } => {
  const combined = runningBalances(
    scenario.quarters.map(q => q.federalOwed + q.stateOwed),
    scenario.quarters.map(q => q.federalPaid + q.statePaid),
  )
  const federal = runningBalances(
    scenario.quarters.map(q => q.federalOwed),
    scenario.quarters.map(q => q.federalPaid),
  )
  const state = runningBalances(
    scenario.quarters.map(q => q.stateOwed),
    scenario.quarters.map(q => q.statePaid),
  )

  const data = scenario.quarters.map((quarter, index): TaxPaymentRow => ({
    rowKey: `q${quarter.quarter}`,
    label: quarterLabel(quarter.quarter),
    ...combined[index],
    breakdown: [
      { rowKey: `q${quarter.quarter}-federal`, label: 'Federal', ...federal[index] },
      { rowKey: `q${quarter.quarter}-state`, label: scenario.stateLabel, ...state[index] },
    ],
  }))

  return { type: 'US_Tax_Payments', data }
}

export const deriveTaxBanner = (scenario: TaxScenario): TaxEstimatesBanner => {
  const combined = runningBalances(
    scenario.quarters.map(q => q.federalOwed + q.stateOwed),
    scenario.quarters.map(q => q.federalPaid + q.statePaid),
  )
  const now = new CalendarDate(scenario.year, 12, 31)
  const currentQuarterIndex = scenario.quarters.length - 1

  const quarters = scenario.quarters.map((quarter, index): TaxEstimatesBannerQuarter => {
    const dueDate = quarterDueDate(scenario.year, quarter.quarter)
    const { rolledOverFromPrevious, owedThisQuarter, totalPaid, remainingBalance } = combined[index]
    const isPastDue = dueDate.compare(now) < 0 && remainingBalance > 0
    const state = remainingBalance <= 0
      ? TaxOverviewDeadlineStatus.Paid
      : isPastDue
        ? TaxOverviewDeadlineStatus.PastDue
        : TaxOverviewDeadlineStatus.Due
    const isCurrentQuarter = index === currentQuarterIndex

    return {
      quarter: quarter.quarter,
      dueDate,
      isPastDue,
      amountOwed: rolledOverFromPrevious + owedThisQuarter,
      state,
      amountPaid: totalPaid,
      balance: remainingBalance,
      uncategorizedCount: isCurrentQuarter ? scenario.uncategorized.count : 0,
      uncategorizedMoneyIn: isCurrentQuarter ? scenario.uncategorized.moneyIn : 0,
      uncategorizedMoneyOut: isCurrentQuarter ? scenario.uncategorized.moneyOut : 0,
      earliestUncategorizedAt: isCurrentQuarter ? scenario.uncategorized.earliestAt : null,
      latestUncategorizedAt: isCurrentQuarter ? scenario.uncategorized.latestAt : null,
    }
  })

  return {
    year: scenario.year,
    taxesDueAt: annualDueDate(scenario.year),
    totalTaxesOwed: projectedTaxesOwed(scenario),
    totalUncategorizedCount: scenario.uncategorized.count,
    totalUncategorizedMoneyIn: scenario.uncategorized.moneyIn,
    totalUncategorizedMoneyOut: scenario.uncategorized.moneyOut,
    earliestUncategorizedAt: scenario.uncategorized.earliestAt,
    latestUncategorizedAt: scenario.uncategorized.latestAt,
    quarters,
  }
}

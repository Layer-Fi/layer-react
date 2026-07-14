import { getLocalTimeZone, today } from '@internationalized/date'

import { type TaxEstimatesBanner, type TaxEstimatesBannerQuarter } from '@schemas/taxEstimates/banner'
import { type TaxDetails, type TaxDetailsRow } from '@schemas/taxEstimates/details'
import { type TaxOverviewApiData, TaxOverviewDeadlineStatus, TaxOverviewMetricType } from '@schemas/taxEstimates/overview'
import { type TaxPaymentRow } from '@schemas/taxEstimates/payments'
import { type TaxSummary } from '@schemas/taxEstimates/summary'

import { type TaxScenario } from '@fixtures/taxEstimates/scenario/types'
import {
  annualDueDate,
  currency,
  effectiveRate,
  federalOwedRemaining,
  federalPaid,
  federalTotal,
  percentage,
  projectedTaxesOwed,
  quarterDueDate,
  quarterLabel,
  runningBalances,
  stateOwedRemaining,
  statePaid,
  stateTotal,
  summaryState,
  taxableIncome,
  totalDeductions,
  totalIncome,
} from '@fixtures/taxEstimates/scenario/utils'

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
  const now = today(getLocalTimeZone())
  const nextDueIndex = scenario.quarters.findIndex(quarter => quarterDueDate(scenario.year, quarter.quarter).compare(now) >= 0)
  const currentQuarterIndex = nextDueIndex === -1 ? scenario.quarters.length - 1 : nextDueIndex
  const { earliestAt, latestAt } = scenario.uncategorized

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
      earliestUncategorizedAt: isCurrentQuarter ? earliestAt : null,
      latestUncategorizedAt: isCurrentQuarter ? latestAt : null,
    }
  })

  return {
    year: scenario.year,
    taxesDueAt: annualDueDate(scenario.year),
    totalTaxesOwed: projectedTaxesOwed(scenario),
    totalUncategorizedCount: scenario.uncategorized.count,
    totalUncategorizedMoneyIn: scenario.uncategorized.moneyIn,
    totalUncategorizedMoneyOut: scenario.uncategorized.moneyOut,
    earliestUncategorizedAt: earliestAt,
    latestUncategorizedAt: latestAt,
    quarters,
  }
}

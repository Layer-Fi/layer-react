import { pipe, Schema } from 'effect'

import type { TaxOverviewDeadlineStatus, TaxOverviewNextTax } from '@schemas/taxEstimates/overview'

const TaxEstimatesBannerQuarterSchema = Schema.Struct({
  quarter: Schema.Number,
  dueDate: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('due_date'),
  ),
  isPastDue: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_past_due'),
  ),
  amountOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('amount_owed'),
  ),
  amountPaid: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('amount_paid'),
  ),
  balance: Schema.Number,
  uncategorizedCount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('uncategorized_count'),
  ),
  uncategorizedSum: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('uncategorized_sum'),
  ),
})

export type TaxEstimatesBannerQuarter = typeof TaxEstimatesBannerQuarterSchema.Type

const TaxEstimatesBannerSchema = Schema.Struct({
  year: Schema.Number,
  totalUncategorizedCount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_uncategorized_count'),
  ),
  totalUncategorizedSum: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_uncategorized_sum'),
  ),
  quarters: Schema.Array(TaxEstimatesBannerQuarterSchema),
})

export type TaxEstimatesBanner = typeof TaxEstimatesBannerSchema.Type

export const getTaxEstimatesBannerQuarterStatus = (
  quarter: TaxEstimatesBannerQuarter,
): TaxOverviewDeadlineStatus => {
  if (quarter.amountOwed > 0 && quarter.balance <= 0) {
    return { kind: 'paid' }
  }

  if (quarter.isPastDue) {
    return { kind: 'pastDue' }
  }

  if (quarter.uncategorizedCount > 0) {
    return { kind: 'categorizationIncomplete' }
  }

  return { kind: 'due' }
}

const findEarliestQuarter = (
  quarters: TaxEstimatesBannerQuarter[],
): TaxEstimatesBannerQuarter | undefined =>
  quarters.reduce<TaxEstimatesBannerQuarter | undefined>(
    (earliest, quarter) =>
      !earliest || quarter.dueDate < earliest.dueDate ? quarter : earliest,
    undefined,
  )

export const getNextTaxFromTaxEstimatesBanner = (
  taxBanner?: TaxEstimatesBanner,
): TaxOverviewNextTax | undefined => {
  if (!taxBanner) {
    return
  }

  const upcomingWithBalance = taxBanner.quarters.filter(
    quarter => !quarter.isPastDue && quarter.balance > 0,
  )
  const anyWithBalance = taxBanner.quarters.filter(quarter => quarter.balance > 0)

  const nextQuarter = findEarliestQuarter(upcomingWithBalance)
    ?? findEarliestQuarter(anyWithBalance)

  if (!nextQuarter) {
    return
  }

  return {
    quarter: nextQuarter.quarter,
    amount: nextQuarter.balance,
    dueAt: nextQuarter.dueDate,
    status: getTaxEstimatesBannerQuarterStatus(nextQuarter),
  }
}

export const TaxEstimatesBannerResponseSchema = Schema.Struct({
  data: TaxEstimatesBannerSchema,
})

export type TaxEstimatesBannerResponse = typeof TaxEstimatesBannerResponseSchema.Type

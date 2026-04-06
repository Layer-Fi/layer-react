import { pipe, Schema } from 'effect'

const TaxOverviewApiDataSchema = Schema.Struct({
  year: Schema.Number,
  excludesPendingTransactions: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
    Schema.fromKey('excludes_pending_transactions'),
  ),
  taxableIncomeEstimate: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxable_income_estimate'),
  ),
  totalIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_income'),
  ),
  totalDeductions: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_deductions'),
  ),
  estimatedTaxesOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('estimated_taxes_owed'),
  ),
  taxesDueDate: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('taxes_due_date'),
  ),
})

export type TaxOverviewApiData = typeof TaxOverviewApiDataSchema.Type

export const TaxOverviewApiResponseSchema = Schema.Struct({
  data: TaxOverviewApiDataSchema,
})

export type TaxOverviewApiResponse = typeof TaxOverviewApiResponseSchema.Type

export type TaxOverviewBannerReview = {
  amount: number
  count: number
  type: 'UNCATEGORIZED_TRANSACTIONS'
}

export type TaxOverviewCategoryKey = 'federal' | 'selfEmployment' | 'state'

export type TaxOverviewCategory = {
  amount: number
  key: TaxOverviewCategoryKey
  label: string
}

export type TaxOverviewDeadlineStatusKind = 'pastDue' | 'paid' | 'due' | 'categorizationIncomplete'

export type TaxOverviewDeadlineStatus = {
  kind: TaxOverviewDeadlineStatusKind
}

export type TaxOverviewDeadlineReviewAction = {
  payload: TaxOverviewBannerReview
}

export type TaxOverviewDeadline = {
  amount: number
  description: string
  dueAt: Date
  id: string
  reviewAction?: TaxOverviewDeadlineReviewAction
  status?: TaxOverviewDeadlineStatus
  title: string
}

export type TaxOverviewNextTax = {
  amount: number
  dueAt: Date
  quarter: number
  status: TaxOverviewDeadlineStatus
}

export type TaxOverviewData = {
  annualDeadline: TaxOverviewDeadline
  bannerReview?: TaxOverviewBannerReview
  deductionsTotal: number
  estimatedTaxCategories: TaxOverviewCategory[]
  estimatedTaxesTotal: number
  incomeTotal: number
  nextTax?: TaxOverviewNextTax
  paymentDeadlines: TaxOverviewDeadline[]
}

import { pipe, Schema } from 'effect'

// ============================================================
// API Response Schema - matches actual /tax-estimates/overview endpoint
// ============================================================

const TaxOverviewApiDataSchema = Schema.Struct({
  year: Schema.Number,
  excludesPendingTransactions: pipe(
    Schema.optionalWith(Schema.Boolean, { default: () => true }),
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
    Schema.optionalWith(Schema.Date, { nullable: true }),
    Schema.fromKey('taxes_due_date'),
  ),
})

export type TaxOverviewApiData = typeof TaxOverviewApiDataSchema.Type

export const TaxOverviewApiResponseSchema = Schema.Struct({
  data: TaxOverviewApiDataSchema,
})

export type TaxOverviewApiResponse = typeof TaxOverviewApiResponseSchema.Type

// ============================================================
// Legacy Types - used by UI components (will be derived from multiple endpoints)
// ============================================================

const TaxOverviewBannerReviewSchema = Schema.Struct({
  type: Schema.Literal('UNCATEGORIZED_TRANSACTIONS'),
  count: Schema.Number,
  amount: Schema.Number,
})

export type TaxOverviewBannerReview = typeof TaxOverviewBannerReviewSchema.Type

const TaxOverviewCategoryKeySchema = Schema.Literal('federal', 'selfEmployment', 'state')

export type TaxOverviewCategoryKey = typeof TaxOverviewCategoryKeySchema.Type

const TaxOverviewCategorySchema = Schema.Struct({
  amount: Schema.Number,
  key: TaxOverviewCategoryKeySchema,
  label: Schema.String,
})

export type TaxOverviewCategory = typeof TaxOverviewCategorySchema.Type

const TaxOverviewDeadlineStatusKindSchema = Schema.Literal('pastDue', 'paid', 'due', 'categorizationIncomplete')

export type TaxOverviewDeadlineStatusKind = typeof TaxOverviewDeadlineStatusKindSchema.Type

const TaxOverviewDeadlineStatusSchema = Schema.Struct({
  kind: TaxOverviewDeadlineStatusKindSchema,
})

export type TaxOverviewDeadlineStatus = typeof TaxOverviewDeadlineStatusSchema.Type

const TaxOverviewDeadlineReviewActionSchema = Schema.Struct({
  payload: TaxOverviewBannerReviewSchema,
})

export type TaxOverviewDeadlineReviewAction = typeof TaxOverviewDeadlineReviewActionSchema.Type

const TaxOverviewDeadlineSchema = Schema.Struct({
  amount: Schema.Number,
  description: Schema.String,
  dueAt: Schema.Date,
  id: Schema.String,
  reviewAction: Schema.optional(TaxOverviewDeadlineReviewActionSchema),
  status: Schema.optional(TaxOverviewDeadlineStatusSchema),
  title: Schema.String,
})

export type TaxOverviewDeadline = typeof TaxOverviewDeadlineSchema.Type

const TaxOverviewNextTaxSchema = Schema.Struct({
  amount: Schema.Number,
  dueAt: Schema.Date,
  quarter: Schema.Number,
  status: TaxOverviewDeadlineStatusSchema,
})

export type TaxOverviewNextTax = typeof TaxOverviewNextTaxSchema.Type

const TaxOverviewDataSchema = Schema.Struct({
  annualDeadline: TaxOverviewDeadlineSchema,
  bannerReview: Schema.optional(TaxOverviewBannerReviewSchema),
  deductionsTotal: Schema.Number,
  estimatedTaxCategories: Schema.Array(TaxOverviewCategorySchema),
  estimatedTaxesTotal: Schema.Number,
  incomeTotal: Schema.Number,
  nextTax: Schema.optional(TaxOverviewNextTaxSchema),
  paymentDeadlines: Schema.Array(TaxOverviewDeadlineSchema),
})

export type TaxOverviewData = typeof TaxOverviewDataSchema.Type

export const TaxOverviewResponseSchema = Schema.Struct({
  data: TaxOverviewDataSchema,
})

export type TaxOverviewResponse = typeof TaxOverviewResponseSchema.Type

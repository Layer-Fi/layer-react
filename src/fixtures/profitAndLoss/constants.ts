export const PROFIT_AND_LOSS_FIXTURE_START_YEAR = 2022
export const PROFIT_AND_LOSS_FIXTURE_BUSINESS_ID = '00000000-0000-4000-8000-000000000201'

export type CategorySplit = readonly [name: string, displayName: string, share: number]

export const INCOME_SPLIT: readonly CategorySplit[] = [
  ['SERVICE_REVENUE', 'Services', 0.54],
  ['PRODUCT_SALES', 'Product Sales', 0.31],
  ['SHIPPING_INCOME', 'Shipping Income', 0.09],
  ['INTEREST_INCOME', 'Interest Income', 0.06],
]

export const COGS_SPLIT: readonly CategorySplit[] = [
  ['MATERIALS', 'Materials & Supplies', 0.58],
  ['SUBCONTRACTORS', 'Subcontractors', 0.28],
  ['FREIGHT', 'Freight & Delivery', 0.14],
]

export const OPEX_SPLIT: readonly CategorySplit[] = [
  ['PAYROLL', 'Payroll', 0.42],
  ['RENT', 'Rent & Lease', 0.17],
  ['MARKETING', 'Marketing', 0.12],
  ['SOFTWARE', 'Software & Subscriptions', 0.09],
  ['INSURANCE', 'Insurance', 0.07],
  ['UTILITIES', 'Utilities', 0.05],
  ['OFFICE_SUPPLIES', 'Office Supplies', 0.04],
  ['TRAVEL', 'Travel & Meals', 0.04],
]

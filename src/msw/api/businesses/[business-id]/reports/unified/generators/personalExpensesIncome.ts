import { Pinning, type UnifiedReport } from '@schemas/reports/unifiedReport'

import { reportRangeFromParams } from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import { generateTableReport } from '@msw/api/businesses/[business-id]/reports/unified/generators/tableReport'
import { sumAmountCentsInRange } from '@fixtures/unifiedReports/deterministicAmounts'

const PERSONAL_EXPENSE_CATEGORIES = ['Groceries', 'Rent', 'Personal Care', 'Health & Wellness', 'Entertainment', 'Dining Out']
const PERSONAL_INCOME_CATEGORIES = ['W-2 Salary', 'Interest Income', 'Dividends', 'Gifts']

const generatePersonalReport = (
  params: URLSearchParams,
  categories: readonly string[],
  keyPrefix: string,
  totalLabel: string,
): UnifiedReport => {
  const { startDate, endDate } = reportRangeFromParams(params)

  return generateTableReport({
    rowHeader: { columnKey: 'name', displayName: 'Category', label: category => category },
    rowKey: category => category,
    items: categories,
    valueColumns: [{
      columnKey: 'total',
      displayName: 'Total',
      // Sum the shared entry stream over the exact range so mid-month bounds are respected, matching account-backed reports.
      value: category => sumAmountCentsInRange(`${keyPrefix}:${category}`, startDate, endDate, { magnitude: 2 }),
      pinning: Pinning.Right,
    }],
    total: { rowKey: `total_${keyPrefix}`, label: totalLabel },
  })
}

export const generatePersonalExpenses = (params: URLSearchParams) =>
  generatePersonalReport(params, PERSONAL_EXPENSE_CATEGORIES, 'personal_expense', 'Total Personal Expenses')

export const generatePersonalIncome = (params: URLSearchParams) =>
  generatePersonalReport(params, PERSONAL_INCOME_CATEGORIES, 'personal_income', 'Total Personal Income')

import { type UnifiedReport } from '@schemas/reports/unifiedReport'

import {
  flatGroupedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/flatGrouped'
import { reportRangeFromParams } from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  type ColumnHeaderKey,
  currencyCell,
  dateCell,
  emptyCell,
  isoDate,
  textCell,
  totalRowLabel,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { entriesInRange } from '@fixtures/unifiedReports/deterministicAmounts'

const PERSONAL_EXPENSE_CATEGORIES = ['Groceries', 'Rent', 'Personal Care', 'Health & Wellness', 'Entertainment', 'Dining Out']
const PERSONAL_INCOME_CATEGORIES = ['W-2 Salary', 'Interest Income', 'Dividends', 'Gifts']

type PersonalLineItem = {
  lineItemId: string
  date: Date
  accountName: string
  description: string
  amountCents: number
}

// The chart fixture has no personal accounts, so each category drives its own entry stream.
const generatePersonalReport = (
  params: URLSearchParams,
  categories: readonly string[],
  keyPrefix: string,
  counterpartyColumn: 'vendor' | 'customer',
  total: { rowKey: string, label: string },
): UnifiedReport => {
  const { startDate, endDate } = reportRangeFromParams(params)

  const items: PersonalLineItem[] = categories
    .flatMap(category => entriesInRange(`${keyPrefix}:${category}`, startDate, endDate, { magnitude: 2 })
      .map((entry, index) => ({
        lineItemId: `${keyPrefix}:${category}:${isoDate(entry.date)}:${index}`,
        date: entry.date,
        accountName: category,
        description: entry.description,
        amountCents: entry.amountCents,
      })))
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.lineItemId.localeCompare(b.lineItemId))

  const columns: ColumnHeaderKey[] = ['date', 'account', counterpartyColumn, 'description', 'amount']

  return flatGroupedReport({
    columns,
    measureColumn: 'amount',
    items,
    rowFor: item => ({
      rowKey: item.lineItemId,
      cells: {
        date: dateCell(item.date),
        account: textCell(item.accountName),
        [counterpartyColumn]: emptyCell(),
        description: textCell(item.description),
        amount: currencyCell(item.amountCents),
      },
    }),
    subtotalCell: (groupItems, options) =>
      currencyCell(groupItems.reduce((sum, item) => sum + item.amountCents, 0), options),
    total,
  })
}

export const generatePersonalExpenses = (params: URLSearchParams) => generatePersonalReport(
  params,
  PERSONAL_EXPENSE_CATEGORIES,
  'personal_expense',
  'vendor',
  { rowKey: 'personal_expenses', label: totalRowLabel('Personal Expenses') },
)

export const generatePersonalIncome = (params: URLSearchParams) => generatePersonalReport(
  params,
  PERSONAL_INCOME_CATEGORIES,
  'personal_income',
  'customer',
  { rowKey: 'personal_income', label: totalRowLabel('Personal Income') },
)

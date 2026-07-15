import { type UnifiedReport } from '@schemas/reports/unifiedReport'

import { generateApAging, generateArAging } from '@msw/api/businesses/[business-id]/reports/unified/generators/aging'
import { generateBalanceSheet } from '@msw/api/businesses/[business-id]/reports/unified/generators/balanceSheet'
import { generateCashflow } from '@msw/api/businesses/[business-id]/reports/unified/generators/cashflow'
import {
  generateBusinessExpenses,
  generateBusinessIncome,
  generatePersonalExpenses,
  generatePersonalIncome,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/expensesIncome'
import { generateLineItemDetail } from '@msw/api/businesses/[business-id]/reports/unified/generators/lines'
import {
  generateBusinessMileage,
  generatePersonalMileage,
  generateTimeTracking,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/mileageAndTime'
import { generateProfitAndLoss } from '@msw/api/businesses/[business-id]/reports/unified/generators/profitAndLoss'
import { generateScheduleC } from '@msw/api/businesses/[business-id]/reports/unified/generators/scheduleC'
import { MOCK_REPORT_BUSINESS_ID } from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { generateTrialBalance } from '@msw/api/businesses/[business-id]/reports/unified/generators/trialBalance'

export type UnifiedReportGenerator = (params: URLSearchParams) => UnifiedReport

export const unifiedReportGenerators: Readonly<Record<string, UnifiedReportGenerator>> = {
  'profit-and-loss': generateProfitAndLoss,
  'profit-and-loss/lines': generateLineItemDetail,
  'balance-sheet': generateBalanceSheet,
  'balance-sheet/lines': generateLineItemDetail,
  'cashflow-statement': generateCashflow,
  'trial-balance': generateTrialBalance,
  'trial-balance/lines': generateLineItemDetail,
  'ar-aging': generateArAging,
  'ap-aging': generateApAging,
  'business-expenses': generateBusinessExpenses,
  'personal-expenses': generatePersonalExpenses,
  'business-income': generateBusinessIncome,
  'personal-income': generatePersonalIncome,
  'business-mileage': generateBusinessMileage,
  'personal-mileage': generatePersonalMileage,
  'time-tracking': generateTimeTracking,
  'tax/schedule-c': generateScheduleC,
  'tax/schedule-c/lines': generateLineItemDetail,
}

export const emptyReport = (): UnifiedReport => ({
  businessId: MOCK_REPORT_BUSINESS_ID,
  columns: [],
  rows: [],
})

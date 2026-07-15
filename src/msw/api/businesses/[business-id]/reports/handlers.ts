import { type RequestHandler } from 'msw'

import { get as getReportConfig } from '@msw/api/businesses/[business-id]/reports/config/get'
import { get as getProfitAndLossReport } from '@msw/api/businesses/[business-id]/reports/profit-and-loss/get'
import { get as getProfitAndLossDetailLines } from '@msw/api/businesses/[business-id]/reports/profit-and-loss/lines/get'
import { get as getProfitAndLossSummaries } from '@msw/api/businesses/[business-id]/reports/profit-and-loss-summaries/get'
import { get as getBankTransactionsExcel } from '@msw/api/businesses/[business-id]/reports/transactions/exports/excel/get'
import { get as getUnifiedReport } from '@msw/api/businesses/[business-id]/reports/unified/get'

export const reportsHandlers: RequestHandler[] = [
  getReportConfig.handler,
  getUnifiedReport.handler,
  getProfitAndLossDetailLines.handler,
  getProfitAndLossReport.handler,
  getProfitAndLossSummaries.handler,
  getBankTransactionsExcel.handler,
]

import { type RequestHandler } from 'msw'

import { invoiceHandlers } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/handlers'
import { get as getInvoices } from '@msw/api/businesses/[business-id]/invoices/get'
import { post as postInvoice } from '@msw/api/businesses/[business-id]/invoices/post'
import { get as getInvoiceSummaryStats } from '@msw/api/businesses/[business-id]/invoices/summary-stats/get'

export const invoicesHandlers: RequestHandler[] = [
  getInvoices.handler,
  postInvoice.handler,
  getInvoiceSummaryStats.handler,
  ...invoiceHandlers,
]

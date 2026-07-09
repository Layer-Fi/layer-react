import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'

import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const PAID_STATUSES = [InvoiceStatus.Paid, InvoiceStatus.PartiallyPaid, InvoiceStatus.Refunded]

const toSummaryStats = (invoices: readonly Invoice[]) => {
  const now = new Date()

  const open = invoices.filter(invoice =>
    (invoice.status === InvoiceStatus.Saved || invoice.status === InvoiceStatus.PartiallyPaid)
    && invoice.sentAt != null,
  )
  const overdue = open.filter(invoice => invoice.dueAt != null && invoice.dueAt < now)

  const sumOutstanding = (subset: readonly Invoice[]) =>
    subset.reduce((sum, invoice) => sum + invoice.outstandingBalance, 0)

  const paymentsTotal = invoices
    .filter(invoice => PAID_STATUSES.includes(invoice.status))
    .reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.outstandingBalance), 0)

  return {
    invoices: {
      overdue_count: overdue.length,
      overdue_total: sumOutstanding(overdue),
      sent_count: open.length,
      sent_total: sumOutstanding(open),
    },
    invoice_payments: {
      sum_total: paymentsTotal,
    },
  }
}

export const get = createMockEndpoint<ReturnType<typeof toSummaryStats>, ReturnType<typeof apiData>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/invoices/summary-stats',
  resolve: ({ override }) => apiData(override ?? toSummaryStats(invoiceStore.all())),
})

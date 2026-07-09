import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'

import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { FIXTURE_TODAY } from '@fixtures/constants/fixtureYear'

const PAID_STATUSES = [InvoiceStatus.Paid, InvoiceStatus.PartiallyPaid, InvoiceStatus.Refunded]

const toSummaryStats = (invoices: readonly Invoice[]) => {
  const open = invoices.filter(invoice =>
    (invoice.status === InvoiceStatus.Saved || invoice.status === InvoiceStatus.PartiallyPaid)
    && invoice.sentAt != null,
  )

  // Overdue and upcoming partition the open invoices - the UI sums both for the
  // total owed, so an invoice must land in exactly one bucket.
  const isOverdue = (invoice: Invoice) => invoice.dueAt != null && invoice.dueAt < FIXTURE_TODAY
  const overdue = open.filter(isOverdue)
  const upcoming = open.filter(invoice => !isOverdue(invoice))

  const sumOutstanding = (subset: readonly Invoice[]) =>
    subset.reduce((sum, invoice) => sum + invoice.outstandingBalance, 0)

  const paymentsTotal = invoices
    .filter(invoice => PAID_STATUSES.includes(invoice.status))
    .reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.outstandingBalance), 0)

  return {
    invoices: {
      overdue_count: overdue.length,
      overdue_total: sumOutstanding(overdue),
      sent_count: upcoming.length,
      sent_total: sumOutstanding(upcoming),
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

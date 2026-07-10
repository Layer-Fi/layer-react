import { endOfYesterday } from 'date-fns'
import { Schema } from 'effect'

import { type Invoice, InvoiceStatus, type InvoiceSummaryStatsResponse, InvoiceSummaryStatsResponseSchema } from '@schemas/invoices/invoice'

import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const PAID_STATUSES = [InvoiceStatus.Paid, InvoiceStatus.PartiallyPaid, InvoiceStatus.Refunded]

const encodeSummaryStats = Schema.encodeSync(InvoiceSummaryStatsResponseSchema)

const toSummaryStats = (invoices: readonly Invoice[]): InvoiceSummaryStatsResponse => {
  const open = invoices.filter(invoice =>
    (invoice.status === InvoiceStatus.Saved || invoice.status === InvoiceStatus.PartiallyPaid)
    && invoice.sentAt != null,
  )

  // Overdue and upcoming partition the open invoices - the UI sums both for the
  // total owed, so an invoice must land in exactly one bucket. Classify against
  // the same real-clock cutoff the list uses (Overdue filter = dueAtEnd:
  // endOfYesterday), so stat cards and list rows never disagree.
  const overdueCutoff = endOfYesterday()
  const isOverdue = (invoice: Invoice) => invoice.dueAt != null && invoice.dueAt <= overdueCutoff
  const overdue = open.filter(isOverdue)
  const upcoming = open.filter(invoice => !isOverdue(invoice))

  const sumOutstanding = (subset: readonly Invoice[]) =>
    subset.reduce((sum, invoice) => sum + invoice.outstandingBalance, 0)

  const paymentsTotal = invoices
    .filter(invoice => PAID_STATUSES.includes(invoice.status))
    .reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.outstandingBalance), 0)

  return {
    invoices: {
      overdueCount: overdue.length,
      overdueTotal: BigInt(sumOutstanding(overdue)),
      sentCount: upcoming.length,
      sentTotal: BigInt(sumOutstanding(upcoming)),
    },
    invoicePayments: {
      sumTotal: BigInt(paymentsTotal),
    },
  }
}

export const get = createMockEndpoint<InvoiceSummaryStatsResponse, ReturnType<typeof apiData>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/invoices/summary-stats',
  resolve: ({ override }) => apiData(encodeSummaryStats(override ?? toSummaryStats(invoiceStore.all()))),
})

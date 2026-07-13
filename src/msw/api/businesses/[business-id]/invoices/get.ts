import { endOfDay, parseISO, startOfDay } from 'date-fns'

import { type Invoice } from '@schemas/invoices/invoice'

import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { encodeInvoice } from '@msw/api/businesses/[business-id]/invoices/toInvoiceResponse'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesQuery } from '@msw/utils/createListFilter'
import { createListSorter } from '@msw/utils/createListSorter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const filterInvoices = createListFilter<Invoice>({
  q: matchesQuery(invoice => [
    invoice.invoiceNumber,
    invoice.recipientName,
    invoice.customer?.companyName,
    invoice.customer?.individualName,
    invoice.customer?.email,
  ]),
  // The client serializes these as date-only strings, so each bound covers the
  // whole local day - due_at_end must include invoices due late that day, or the
  // Overdue list disagrees with the summary-stats endOfYesterday cutoff.
  due_at_start: (invoice, value) =>
    value == null || value === '' || (invoice.dueAt != null && invoice.dueAt >= startOfDay(parseISO(value))),
  due_at_end: (invoice, value) =>
    value == null || value === '' || (invoice.dueAt != null && invoice.dueAt <= endOfDay(parseISO(value))),
})

const filterByStatuses = (invoices: readonly Invoice[], request: Request): readonly Invoice[] => {
  const statuses = new URL(request.url).searchParams.getAll('status')

  return statuses.length === 0
    ? invoices
    : invoices.filter(invoice => statuses.includes(invoice.status))
}

const sortInvoices = createListSorter<Invoice>({
  sent_at: invoice => invoice.sentAt?.getTime() ?? 0,
}, 'sent_at')

export const get = createMockEndpoint<readonly Invoice[], ReturnType<typeof paginatedApiData>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/invoices',
  resolve: ({ override: invoices = invoiceStore.all(), request }) =>
    paginatedApiData(
      sortInvoices(filterInvoices([...filterByStatuses(invoices, request)], request), request)
        .map(invoice => encodeInvoice(invoice)),
      request,
    ),
})

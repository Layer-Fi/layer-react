import { BigDecimal } from 'effect'
import { http, HttpResponse } from 'msw'

import { type Invoice } from '@schemas/invoices/invoice'

import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'

const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`

const formatDate = (date: Date | null) => date == null ? '—' : date.toISOString().slice(0, 10)

// User-entered invoice fields are interpolated into this markup, so escape them.
const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;')

const renderInvoiceHtml = (invoice: Invoice | undefined) => {
  if (invoice == null) {
    return '<html><body><p>Invoice not found</p></body></html>'
  }

  const rows = invoice.lineItems.map(lineItem => `
    <tr>
      <td>${escapeHtml(lineItem.description ?? '')}</td>
      <td>${BigDecimal.format(lineItem.quantity)}</td>
      <td>${formatCents(lineItem.unitPrice)}</td>
      <td>${formatCents(lineItem.totalAmount)}</td>
    </tr>`).join('')

  return `<html>
  <body style="font-family: sans-serif; margin: 40px;">
    <h1>Invoice ${escapeHtml(invoice.invoiceNumber ?? '')}</h1>
    <p>Billed to: ${escapeHtml(invoice.recipientName ?? '—')}</p>
    <p>Sent: ${formatDate(invoice.sentAt)} · Due: ${formatDate(invoice.dueAt)}</p>
    <table width="100%" cellpadding="8" style="border-collapse: collapse; text-align: left;">
      <thead>
        <tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p>Subtotal: ${formatCents(invoice.subtotal)}</p>
    <p>Tax: ${formatCents(invoice.additionalSalesTaxesTotal)}</p>
    <p><strong>Total: ${formatCents(invoice.totalAmount)}</strong></p>
    ${invoice.customPaymentInstructions == null ? '' : `<p>${escapeHtml(invoice.customPaymentInstructions)}</p>`}
  </body>
</html>`
}

/*
 * The invoice preview is fetched with `getText`, so this returns raw HTML
 * rather than the JSON envelope createMockEndpoint produces.
 */
export const get = {
  handler: http.get('*/v1/businesses/:businessId/invoices/:invoiceId/html', ({ params }) =>
    HttpResponse.html(renderInvoiceHtml(invoiceStore.findById(params.invoiceId as string)))),
}

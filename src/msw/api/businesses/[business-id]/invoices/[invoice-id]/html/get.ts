import { http, HttpResponse } from 'msw'

import { type Invoice } from '@schemas/invoices/invoice'

import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'

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

  return `<html>
  <body style="margin: 0; background: #fff; font-family: sans-serif;">
    <main style="display: grid; padding: 24px;">
      <section style="display: grid; place-items: center; min-block-size: 48rem; border: 2px dashed #d4d4d8; border-radius: 8px; text-align: center; color: #71717a;">
        <div>
          <p style="margin: 0; font-size: 1.25rem;">Invoice PDF here</p>
          <p style="margin: 8px 0 0; font-size: 0.875rem;">${escapeHtml(invoice.invoiceNumber ?? '')}</p>
        </div>
      </section>
    </main>
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

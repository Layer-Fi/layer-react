import { type RequestHandler } from 'msw'

import { put as putFinalizeInvoice } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/finalize-invoice/put'
import { get as getInvoiceHtml } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/html/get'
import { patch as patchInvoice } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/patch'
import { put as putInvoicePayment } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/payment/[invoice-payment-id]/put'
import { post as postInvoicePayment } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/payment/post'
import { get as getInvoicePaymentMethods } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/payment-methods/get'
import { get as getInvoicePdf } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/pdf/get'
import { post as postRefundInvoice } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/refund/post'
import { post as postResetInvoice } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/reset/post'
import { post as postVoidInvoice } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/void/post'
import { post as postWriteoffInvoice } from '@msw/api/businesses/[business-id]/invoices/[invoice-id]/write-off/post'

export const invoiceHandlers: RequestHandler[] = [
  patchInvoice.handler,
  postVoidInvoice.handler,
  postResetInvoice.handler,
  postWriteoffInvoice.handler,
  postRefundInvoice.handler,
  postInvoicePayment.handler,
  putInvoicePayment.handler,
  putFinalizeInvoice.handler,
  getInvoicePaymentMethods.handler,
  getInvoicePdf.handler,
  getInvoiceHtml.handler,
]

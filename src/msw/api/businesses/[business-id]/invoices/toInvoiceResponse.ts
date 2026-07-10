import { Schema } from 'effect'

import { type Invoice, InvoiceSchema } from '@schemas/invoices/invoice'

import { apiData } from '@msw/utils/apiResponse'

export const encodeInvoice = Schema.encodeSync(InvoiceSchema)

export const toInvoiceResponse = (invoice: Invoice) => apiData(encodeInvoice(invoice))

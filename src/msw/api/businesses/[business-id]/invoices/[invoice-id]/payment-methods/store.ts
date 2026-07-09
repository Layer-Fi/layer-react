import { InvoicePaymentMethod } from '@schemas/invoices/invoicePaymentMethod'

import { createMockStore } from '@msw/utils/createMockStore'

export const DEFAULT_INVOICE_PAYMENT_METHODS: readonly InvoicePaymentMethod[] = [
  InvoicePaymentMethod.ACH,
  InvoicePaymentMethod.CreditCard,
]

type InvoicePaymentMethodsEntry = {
  /** The invoice id the payment methods belong to. */
  id: string
  paymentMethods: readonly InvoicePaymentMethod[]
}

export const invoicePaymentMethodsStore = createMockStore<InvoicePaymentMethodsEntry>(() => [])

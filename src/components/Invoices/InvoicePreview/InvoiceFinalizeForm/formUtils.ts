import type { InvoicePaymentMethod as InvoicePaymentMethodType } from '@features/invoices/invoicePaymentMethodSchemas'
import { InvoicePaymentMethod } from '@features/invoices/invoicePaymentMethodSchemas'
import type { Invoice } from '@features/invoices/invoiceSchemas'

export type InvoiceFinalizeFormValues = {
  achEnabled: boolean
  creditCardEnabled: boolean
  customPaymentInstructions: string
}

type GetInvoiceFinalizeFormDefaultValuesProps = {
  invoice: Invoice
  paymentMethods: readonly InvoicePaymentMethodType[]
}

export const getInvoiceFinalizeFormDefaultValues = ({
  invoice,
  paymentMethods,
}: GetInvoiceFinalizeFormDefaultValuesProps): InvoiceFinalizeFormValues => ({
  achEnabled: paymentMethods.includes(InvoicePaymentMethod.ACH),
  creditCardEnabled: paymentMethods.includes(InvoicePaymentMethod.CreditCard),
  customPaymentInstructions: invoice.customPaymentInstructions || '',
})

export const convertInvoiceFinalizeFormToParams = (
  form: InvoiceFinalizeFormValues,
): unknown => ({
  paymentMethods: [
    ...(form.achEnabled ? [InvoicePaymentMethod.ACH] : []),
    ...(form.creditCardEnabled ? [InvoicePaymentMethod.CreditCard] : []),
  ],
  customPaymentInstructions: form.customPaymentInstructions.trim(),
})

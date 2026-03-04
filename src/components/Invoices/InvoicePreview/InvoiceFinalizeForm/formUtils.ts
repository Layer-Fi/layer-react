import type { InvoicePaymentMethod as InvoicePaymentMethodType } from '@features/invoices/invoicePaymentMethodSchemas'
import { InvoicePaymentMethod } from '@features/invoices/invoicePaymentMethodSchemas'
import type { Invoice } from '@features/invoices/invoiceSchemas'

export type InvoiceFinalizeFormValues = {
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
  creditCardEnabled: paymentMethods.includes(InvoicePaymentMethod.CreditCard),
  customPaymentInstructions: invoice.customPaymentInstructions || '',
})

export const convertInvoiceFinalizeFormToParams = (
  form: InvoiceFinalizeFormValues,
): unknown => ({
  paymentMethods: [
    ...(form.creditCardEnabled ? [InvoicePaymentMethod.CreditCard] : []),
  ],
  customPaymentInstructions: form.customPaymentInstructions.trim(),
})

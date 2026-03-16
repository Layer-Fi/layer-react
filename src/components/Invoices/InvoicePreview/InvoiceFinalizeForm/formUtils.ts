import type { TFunction } from 'i18next'

import type { Invoice } from '@schemas/invoices/invoice'
import type { InvoicePaymentMethod as InvoicePaymentMethodType } from '@schemas/invoices/invoicePaymentMethod'
import { InvoicePaymentMethod } from '@schemas/invoices/invoicePaymentMethod'

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

export const validateInvoiceFinalizeForm = (
  { value }: { value: InvoiceFinalizeFormValues },
  t: TFunction,
) => {
  const { creditCardEnabled, customPaymentInstructions } = value

  const errors = []
  if (!creditCardEnabled && !customPaymentInstructions.trim()) {
    errors.push({
      creditCardEnabled: t('invoices:eitherAPaymentMethodOrCustomPaymentInstructionsMustBeSetOnAnInvoice', 'Either a payment method or custom payment instructions must be set on an invoice'),
    })
  }

  return errors.length > 0 ? errors : null
}

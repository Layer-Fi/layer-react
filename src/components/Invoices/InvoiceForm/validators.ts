import { type InvoiceForm, InvoiceFormStep } from '@features/invoices/invoiceSchemas'

import { validateInvoiceForm as validateInvoiceDetailsFields } from './formUtils'

export const validatePaymentMethodsStep = () => null

export const validateInvoiceFormByStep = ({ value }: { value: InvoiceForm }) => {
  if (value.step === InvoiceFormStep.Details) {
    return validateInvoiceDetailsFields({ value })
  }
  if (value.step === InvoiceFormStep.PaymentMethods) {
    return validatePaymentMethodsStep()
  }
  return null
}

import { createContext, useContext } from 'react'
import { type BigDecimal as BD } from 'effect'

import type { InvoiceFormType } from '@components/Invoices/InvoiceForm/useInvoiceForm'

type InvoiceFormContextValue = {
  form: InvoiceFormType
  isReadOnly: boolean
  totals: {
    subtotal: BD.BigDecimal
    additionalDiscount: BD.BigDecimal
    taxableSubtotal: BD.BigDecimal
    taxes: BD.BigDecimal
    grandTotal: BD.BigDecimal
  }
  enableCustomerManagement: boolean
  initialDueAt: Date | null
  onClickEditCustomer: () => void
  onClickCreateNewCustomer: (inputValue: string) => void
  paymentMethodsIsLoading: boolean
  paymentMethodsIsError: boolean
}

const InvoiceFormContext = createContext<InvoiceFormContextValue | null>(null)

export const useInvoiceFormContext = () => {
  const context = useContext(InvoiceFormContext)

  if (context == null) {
    throw new Error('Invoice form components must be wrapped in <InvoiceFormContextProvider />')
  }

  return context
}

export const InvoiceFormContextProvider = InvoiceFormContext.Provider

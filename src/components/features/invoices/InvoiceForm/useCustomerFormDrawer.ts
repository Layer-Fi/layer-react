import { useCallback, useState } from 'react'

import type { Customer } from '@schemas/customer'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import type { CustomerFormState } from '@features/customerVendor/CustomerForm/formUtils'
import type { InvoiceFormType } from '@features/invoices/InvoiceForm/useInvoiceForm'

export const useCustomerFormDrawer = (form: InvoiceFormType) => {
  const [customerFormState, setCustomerFormState] = useState<CustomerFormState | null>(null)

  const editCustomer = useCallback(() => {
    const customer = form.getFieldValue('customer')
    if (customer) {
      setCustomerFormState({ mode: UpsertMode.Update, customer })
    }
  }, [form])

  const createCustomer = useCallback((initialName: string) => {
    setCustomerFormState({ mode: UpsertMode.Create, initialName })
  }, [])

  const close = useCallback(() => {
    setCustomerFormState(null)
  }, [])

  const onOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      close()
    }
  }, [close])

  const onSuccess = useCallback((customer: Customer) => {
    close()
    form.setFieldValue('customer', customer)
    form.setFieldValue('email', customer.email || '')
    form.setFieldValue('address', customer.addressString || '')
  }, [form, close])

  return {
    formState: customerFormState,
    isOpen: !!customerFormState,
    onOpenChange,
    editCustomer,
    createCustomer,
    onSuccess,
  }
}

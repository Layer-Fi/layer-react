import { useCallback, useState } from 'react'

import type { Customer } from '@schemas/customer'
import type { CustomerFormState } from '@components/CustomerForm/formUtils'
import type { InvoiceFormType } from '@components/Invoices/InvoiceForm/useInvoiceForm'
import { UpsertCustomerMode } from '@features/customers/api/useUpsertCustomer'

export const useCustomerFormDrawer = (form: InvoiceFormType) => {
  const [customerFormState, setCustomerFormState] = useState<CustomerFormState | null>(null)

  const editCustomer = useCallback(() => {
    const customer = form.getFieldValue('customer')
    if (customer) {
      setCustomerFormState({ mode: UpsertCustomerMode.Update, customer })
    }
  }, [form])

  const createCustomer = useCallback((initialName: string) => {
    setCustomerFormState({ mode: UpsertCustomerMode.Create, initialName })
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

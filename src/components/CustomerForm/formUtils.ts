import { type Customer, type CustomerForm } from '@schemas/customer'
import { UpsertCustomerMode } from '@features/customers/api/useUpsertCustomer'

export type CustomerFormState =
  | { mode: UpsertCustomerMode.Update, customer: Customer }
  | { mode: UpsertCustomerMode.Create, initialName?: string }

export const getCustomerFormDefaultValues = (state: CustomerFormState): CustomerForm => {
  if (state.mode === UpsertCustomerMode.Update) {
    const { customer } = state
    return {
      individualName: customer.individualName || '',
      companyName: customer.companyName || '',
      email: customer.email || '',
      addressString: customer.addressString || '',
    }
  }

  return {
    individualName: state.initialName || '',
    companyName: '',
    email: '',
    addressString: '',
  }
}

export const validateCustomerForm = ({ customer }: { customer: CustomerForm }) => {
  const { individualName, companyName, email } = customer

  const errors = []

  // At least one of individual name or company name is required
  if (!individualName.trim() && !companyName.trim()) {
    errors.push({ individualName: 'Either individual name or company name is required.' })
  }

  if (!email.trim()) {
    errors.push({ email: 'Email is a required field.' })
  }

  return errors.length > 0 ? errors : null
}

export const convertCustomerFormToUpsertCustomer = (form: CustomerForm): unknown => {
  return {
    individualName: form.individualName.trim() || null,
    companyName: form.companyName.trim() || null,
    email: form.email.trim() || null,
    addressString: form.addressString.trim() || null,
  }
}

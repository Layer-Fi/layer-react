import { FormDataTypes} from './types'
import { Business } from '../../types'
import { BaseSelectOption } from '../../types/general'

export const buildDefaultValues = (business?: Business) => {
  if (!business) {
    return {} as Partial<FormDataTypes>
  }
  
  const data: Partial<FormDataTypes> = {}
  
  if (business.legal_name) {
    data.legal_name = business.legal_name
  }
  
  if (business.phone_number) {
    data.phone_number = business.phone_number
  }
  
  if (business.entity_type) {
    data.entity_type = business.entity_type
  }
  
  if (business.us_state) {
    data.us_state = business.us_state
  }
  
  if (business.tin) {
    data.tin = business.tin
  }
  
  return data
}

export const buildSelectOptions = (strings: string[]) => strings.map(s => ({
  label: s,
  value: s,
}))

export const findSelectOption = (options: BaseSelectOption[], value?: string) => {
  if (!value) {
    return undefined
  }
  
  return options.find(o => (o.value as string).toLowerCase() === value.toLowerCase())
}
  
export const formatPhoneNumber = (phone?: string) => {
  if (phone === undefined) {
    return phone
  }
  
  return phone.replace(/[^-()0-9]/g, '')
}
  
export const validateEmailFormat = (email?: string) =>  {
  if (!email) {
    return true
  }
  
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
  
export const validateLength = (value?: string, max = 255) => {
  if (!value) {
    return true
  }
  
  return value.length <= max
}

export const validateFormFields = (formData: Partial<FormDataTypes>) => {
  const newErrors: Record<string, string>= {}

  if (!validateEmailFormat(formData.email ?? '')) {
    newErrors['email'] = 'Wrong format'
  }

  if (!validateLength(formData.email)) {
    newErrors['email'] = 'Email is too long'
  }

  if (!validateLength(formData.legal_name)) {
    newErrors['legal_name'] = 'Name is too long'
  }

  if (!validateLength(formData.dba)) {
    newErrors['dba'] = 'DBA is too long'
  }

  if (!validateLength(formData.first_name)) {
    newErrors['first_name'] = 'First name is too long'
  }

  if (!validateLength(formData.last_name)) {
    newErrors['last_name'] = 'Last name is too long'
  }

  if (!validateLength(formData.phone_number)) {
    newErrors['phone_number'] = 'Phone number is too long'
  }

  if (!validateLength(formData.tin, 20)) {
    newErrors['tin'] = 'Tax ID is too long'
  }

  return newErrors
}

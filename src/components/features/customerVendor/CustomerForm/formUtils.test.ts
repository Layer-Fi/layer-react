import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'

import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import {
  convertCustomerFormToUpsertCustomer,
  getCustomerFormDefaultValues,
  validateCustomerForm,
} from '@features/customerVendor/CustomerForm/formUtils'

import { makeCustomer } from '@fixtures/customers/mocks'

const t = ((_key: string, defaultValue: string) => defaultValue) as TFunction

describe('getCustomerFormDefaultValues', () => {
  it('fills form defaults from an existing customer in update mode', () => {
    const customer = makeCustomer({
      individualName: 'Jane Doe',
      companyName: 'Acme Corp',
      email: 'jane@acme.test',
      addressString: '123 Main St',
    })

    expect(getCustomerFormDefaultValues({ mode: UpsertMode.Update, customer })).toEqual({
      individualName: 'Jane Doe',
      companyName: 'Acme Corp',
      email: 'jane@acme.test',
      addressString: '123 Main St',
    })
  })

  it('falls back to empty strings for null fields in update mode', () => {
    const customer = makeCustomer({ individualName: null, companyName: null, email: null, addressString: null })

    expect(getCustomerFormDefaultValues({ mode: UpsertMode.Update, customer })).toEqual({
      individualName: '',
      companyName: '',
      email: '',
      addressString: '',
    })
  })

  it('seeds individualName from initialName in create mode', () => {
    expect(getCustomerFormDefaultValues({ mode: UpsertMode.Create, initialName: 'Prefilled Name' })).toEqual({
      individualName: 'Prefilled Name',
      companyName: '',
      email: '',
      addressString: '',
    })
  })

  it('defaults to empty strings in create mode with no initialName', () => {
    expect(getCustomerFormDefaultValues({ mode: UpsertMode.Create })).toEqual({
      individualName: '',
      companyName: '',
      email: '',
      addressString: '',
    })
  })
})

describe('validateCustomerForm', () => {
  const baseForm = { individualName: '', companyName: '', email: '', addressString: '' }

  it('returns null when individual name and email are present', () => {
    const result = validateCustomerForm({ customer: { ...baseForm, individualName: 'Jane Doe', email: 'jane@acme.test' } }, t)

    expect(result).toBeNull()
  })

  it('returns null when company name stands in for individual name', () => {
    const result = validateCustomerForm({ customer: { ...baseForm, companyName: 'Acme Corp', email: 'jane@acme.test' } }, t)

    expect(result).toBeNull()
  })

  it('requires either individual name or company name', () => {
    const result = validateCustomerForm({ customer: { ...baseForm, email: 'jane@acme.test' } }, t)

    expect(result).toEqual([
      { individualName: 'Either individual name or company name is required.' },
    ])
  })

  it('requires email', () => {
    const result = validateCustomerForm({ customer: { ...baseForm, individualName: 'Jane Doe' } }, t)

    expect(result).toEqual([
      { email: 'Email is a required field.' },
    ])
  })

  it('treats whitespace-only values as missing', () => {
    const result = validateCustomerForm({ customer: { ...baseForm, individualName: '   ', email: '   ' } }, t)

    expect(result).toEqual([
      { individualName: 'Either individual name or company name is required.' },
      { email: 'Email is a required field.' },
    ])
  })
})

describe('convertCustomerFormToUpsertCustomer', () => {
  it('trims values and maps blank strings to null', () => {
    const result = convertCustomerFormToUpsertCustomer({
      individualName: '  Jane Doe  ',
      companyName: '',
      email: '  jane@acme.test  ',
      addressString: '   ',
    })

    expect(result).toEqual({
      individualName: 'Jane Doe',
      companyName: null,
      email: 'jane@acme.test',
      addressString: null,
    })
  })
})

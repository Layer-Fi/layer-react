import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { type Customer } from '@schemas/features/customerVendor/customer'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { CustomerForm, type CustomerFormProps } from '@features/customerVendor/CustomerForm/CustomerForm'

import { makeCustomer } from '@fixtures/customers/mocks'
import { patch as patchCustomer } from '@msw/api/businesses/[business-id]/customers/[customer-id]/patch'
import { post as postCustomer } from '@msw/api/businesses/[business-id]/customers/post'
import { server } from '@msw/node'
import { readRequestJson } from '@msw/utils/request'
import { createFormFiller, type FillFormSpec } from '@testUtils/forms/fillForm'
import { LayerTestProvider, TEST_LAYER_BUSINESS_ID } from '@testUtils/render/LayerTestProvider'

const FORM_DATA = [
  { kind: 'text', field: 'Individual name', value: 'Jane Doe' },
  { kind: 'text', field: 'Email', value: 'jane@acme.test' },
] satisfies readonly FillFormSpec[]

const EXPECTED_CREATE_BODY = {
  individual_name: 'Jane Doe',
  company_name: null,
  email: 'jane@acme.test',
  address_string: null,
}

const MOCK_CUSTOMER = makeCustomer({ individualName: 'Jane Doe', email: 'jane@acme.test' })

const renderCustomerForm = (props: CustomerFormProps) => {
  const user = userEvent.setup()

  return {
    user,
    filler: createFormFiller(user),
    ...render(<CustomerForm {...props} />, { wrapper: LayerTestProvider }),
  }
}

const mockCreateCustomer = (response: Customer = makeCustomer()) => {
  const createCustomerRequest = vi.fn()

  server.use(
    postCustomer.mock(response, {
      onRequest: async ({ request, params }) => {
        createCustomerRequest({ body: await readRequestJson(request), businessId: params.businessId })
      },
    }),
  )

  return createCustomerRequest
}

const mockCreateCustomerError = () => {
  const createCustomerRequest = vi.fn()

  server.use(
    postCustomer.mockError({ errors: [{ description: 'Unable to create customer' }] }, {
      status: 500,
      onRequest: async ({ request, params }) => {
        createCustomerRequest({ body: await readRequestJson(request), businessId: params.businessId })
      },
    }),
  )

  return createCustomerRequest
}

const mockUpdateCustomer = (response: Customer) => {
  const updateCustomerRequest = vi.fn()

  server.use(
    patchCustomer.mock(response, {
      onRequest: async ({ request, params }) => {
        updateCustomerRequest({ body: await readRequestJson(request), businessId: params.businessId, customerId: params.customerId })
      },
    }),
  )

  return updateCustomerRequest
}

describe('CustomerForm', () => {
  it('shows validation errors for required fields', async () => {
    const onSuccess = vi.fn()
    const createCustomerRequest = mockCreateCustomer()
    const { user } = renderCustomerForm({ mode: UpsertMode.Create, onSuccess })

    await user.click(screen.getByRole('button', { name: /save customer/i }))

    expect(await screen.findByText('Either individual name or company name is required.')).toBeInTheDocument()

    expect(createCustomerRequest).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('creates the customer and calls onSuccess with the created customer', async () => {
    const onSuccess = vi.fn()
    const createCustomerRequest = mockCreateCustomer(MOCK_CUSTOMER)
    const { user, filler } = renderCustomerForm({ mode: UpsertMode.Create, onSuccess })

    await filler.fill(FORM_DATA)
    await user.click(screen.getByRole('button', { name: /save customer/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(MOCK_CUSTOMER)
    })
    expect(createCustomerRequest).toHaveBeenCalledTimes(1)
    expect(createCustomerRequest).toHaveBeenCalledWith({
      body: EXPECTED_CREATE_BODY,
      businessId: TEST_LAYER_BUSINESS_ID,
    })
  })

  it('seeds individualName from initialName in create mode', () => {
    renderCustomerForm({ mode: UpsertMode.Create, initialName: 'Prefilled Name', onSuccess: vi.fn() })

    expect(screen.getByRole('textbox', { name: 'Individual name' })).toHaveValue('Prefilled Name')
  })

  it('shows an API error and does not call onSuccess when create fails', async () => {
    const onSuccess = vi.fn()
    const createCustomerRequest = mockCreateCustomerError()
    const { user, filler } = renderCustomerForm({ mode: UpsertMode.Create, onSuccess })

    await filler.fill(FORM_DATA)
    await user.click(screen.getByRole('button', { name: /save customer/i }))

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument()

    expect(createCustomerRequest).toHaveBeenCalledTimes(1)
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('prefills fields from the existing customer in update mode and patches on submit', async () => {
    const onSuccess = vi.fn()
    const existingCustomer = makeCustomer({ individualName: 'Jane Doe', companyName: 'Acme Corp', email: 'jane@acme.test', addressString: '123 Main St' })
    const updatedCustomer = { ...existingCustomer, addressString: '456 Side St' }
    const updateCustomerRequest = mockUpdateCustomer(updatedCustomer)

    const { user } = renderCustomerForm({ mode: UpsertMode.Update, customer: existingCustomer, onSuccess })

    expect(screen.getByRole('textbox', { name: 'Individual name' })).toHaveValue('Jane Doe')
    expect(screen.getByRole('textbox', { name: 'Company name' })).toHaveValue('Acme Corp')
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('jane@acme.test')

    await user.click(screen.getByRole('button', { name: /save customer/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(updatedCustomer)
    })
    expect(updateCustomerRequest).toHaveBeenCalledWith({
      body: {
        individual_name: 'Jane Doe',
        company_name: 'Acme Corp',
        email: 'jane@acme.test',
        address_string: '123 Main St',
      },
      businessId: TEST_LAYER_BUSINESS_ID,
      customerId: existingCustomer.id,
    })
  })

  it('disables fields and hides the submit action when read-only', () => {
    const existingCustomer = makeCustomer({ individualName: 'Jane Doe' })
    renderCustomerForm({ mode: UpsertMode.Update, customer: existingCustomer, onSuccess: vi.fn(), isReadOnly: true })

    expect(screen.getByRole('textbox', { name: 'Individual name' })).toHaveAttribute('readonly')
  })
})

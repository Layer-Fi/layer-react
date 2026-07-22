import { type ComponentProps, useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { type Customer } from '@schemas/customer'
import { CustomerSelector } from '@components/CustomerSelector/CustomerSelector'

import { get as getAccountingConfig } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { get as getCustomers } from '@msw/api/businesses/[business-id]/customers/get'
import { post as postCustomer } from '@msw/api/businesses/[business-id]/customers/post'
import { server } from '@msw/node'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { makeCustomer } from '@fixtures/customers/mocks'
import { LayerTestProvider } from '@test-utils/LayerTestProvider'

type SelectorProps = Partial<ComponentProps<typeof CustomerSelector>>

const renderSelector = (props: SelectorProps = {}, { managementEnabled = true } = {}) => {
  const user = userEvent.setup()
  const onChange = vi.fn()

  server.use(getAccountingConfig.mock(makeAccountingConfiguration({ enableCustomerManagement: managementEnabled })))

  function Harness() {
    const [selected, setSelected] = useState<Customer | null>(null)
    return (
      <CustomerSelector
        {...props}
        selectedCustomer={selected}
        onSelectedCustomerChange={(customer) => {
          setSelected(customer)
          onChange(customer)
        }}
      />
    )
  }

  return { user, onChange, ...render(<Harness />, { wrapper: LayerTestProvider }) }
}

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await waitFor(() => expect(screen.getByLabelText('Customer')).toBeEnabled())
  const input = screen.getByLabelText('Customer')
  await user.click(input)
  return input
}

describe('CustomerSelector (creatable)', () => {
  it('never offers to create when the consumer opts out', async () => {
    server.use(getCustomers.mock([]))
    const { user } = renderSelector({ isCreatable: false })

    const input = await openMenu(user)
    await user.type(input, 'New Person')

    expect(screen.queryByRole('option', { name: /^Create/ })).not.toBeInTheDocument()
  })

  it('never offers to create when customer management is disabled', async () => {
    server.use(getCustomers.mock([]))
    const { user } = renderSelector({ isCreatable: true }, { managementEnabled: false })

    const input = await openMenu(user)
    await user.type(input, 'New Person')

    expect(screen.queryByRole('option', { name: /^Create/ })).not.toBeInTheDocument()
  })

  it('only reveals the create option once a name is typed', async () => {
    server.use(getCustomers.mock([]))
    const { user } = renderSelector({ isCreatable: true })

    const input = await openMenu(user)
    expect(await screen.findByText('Type a name to add a customer')).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /^Create "/ })).not.toBeInTheDocument()

    await user.type(input, 'Riley')
    expect(await screen.findByRole('option', { name: 'Create "Riley"' })).toBeInTheDocument()
  })

  it('creates a customer from the trimmed individual name and selects it', async () => {
    const NEW_CUSTOMER = makeCustomer({ id: '00000000-0000-4000-8000-0000000000c1', individualName: 'Riley Rivera', companyName: null })
    let createdBody: unknown
    server.use(
      getCustomers.mock([]),
      postCustomer.mock(NEW_CUSTOMER, { onRequest: async ({ request }) => { createdBody = await request.json() } }),
    )
    const { user, onChange } = renderSelector({ isCreatable: true })

    const input = await openMenu(user)
    await user.type(input, '  Riley Rivera  ')
    await user.click(await screen.findByRole('option', { name: /^Create "/ }))

    await waitFor(() => expect(createdBody).toEqual({ individual_name: 'Riley Rivera' }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: NEW_CUSTOMER.id }))
    expect(await screen.findByText('Riley Rivera')).toBeInTheDocument()
  })

  it('surfaces an inline error and selects nothing when the create fails', async () => {
    server.use(
      getCustomers.mock([]),
      postCustomer.mockError({ errors: [{ description: 'nope' }] }),
    )
    const { user, onChange } = renderSelector({ isCreatable: true })

    const input = await openMenu(user)
    await user.type(input, 'Doomed Person')
    await user.click(await screen.findByRole('option', { name: 'Create "Doomed Person"' }))

    expect(await screen.findByText('Could not create customer. Please try again.')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disables the field while a create is in flight', async () => {
    let releaseCreate: (() => void) | undefined
    const NEW_CUSTOMER = makeCustomer({ id: '00000000-0000-4000-8000-0000000000c2', individualName: 'Slow Person', companyName: null })
    server.use(
      getCustomers.mock([]),
      postCustomer.mock(NEW_CUSTOMER, { onRequest: () => new Promise<void>((resolve) => { releaseCreate = resolve }) }),
    )
    const { user } = renderSelector({ isCreatable: true })

    const input = await openMenu(user)
    await user.type(input, 'Slow Person')
    await user.click(await screen.findByRole('option', { name: 'Create "Slow Person"' }))

    await waitFor(() => expect(screen.getByLabelText('Customer')).toBeDisabled())
    expect(releaseCreate).toBeDefined()

    releaseCreate?.()
    await waitFor(() => expect(screen.getByText('Slow Person')).toBeInTheDocument())
  })

  it('delegates to onCreateCustomer without calling the API, and offers create with no typed name', async () => {
    let apiCalled = false
    const onCreateCustomer = vi.fn()
    server.use(
      getCustomers.mock([]),
      postCustomer.mock(makeCustomer(), { onRequest: () => { apiCalled = true } }),
    )
    const { user } = renderSelector({ isCreatable: true, onCreateCustomer })

    await openMenu(user)
    // Delegate flow can create with no typed name (e.g. opening a drawer).
    await user.click(await screen.findByRole('option', { name: 'Create new customer' }))

    expect(onCreateCustomer).toHaveBeenCalledTimes(1)
    expect(apiCalled).toBe(false)
  })
})

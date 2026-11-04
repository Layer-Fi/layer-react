import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { CustomerFormDrawer, type CustomerFormDrawerProps } from '@features/customerVendor/CustomerFormDrawer/CustomerFormDrawer'

import { makeCustomer } from '@fixtures/customers/mocks'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const renderDrawer = (props: Partial<CustomerFormDrawerProps> = {}) => {
  const user = userEvent.setup()

  return {
    user,
    ...render(
      (
        <CustomerFormDrawer
          isOpen
          onOpenChange={vi.fn()}
          onSuccess={vi.fn()}
          formState={{ mode: UpsertMode.Create }}
          {...props}
        />
      ),
      { wrapper: LayerTestProvider },
    ),
  }
}

describe('CustomerFormDrawer', () => {
  it('renders nothing when formState is null', () => {
    renderDrawer({ formState: null })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the create title and form when creating a customer', () => {
    renderDrawer({ formState: { mode: UpsertMode.Create } })

    expect(screen.getByRole('dialog', { name: 'Create new customer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save customer/i })).toBeInTheDocument()
  })

  it('shows the edit title and prefilled form when editing a customer', () => {
    const customer = makeCustomer({ individualName: 'Jane Doe' })
    renderDrawer({ formState: { mode: UpsertMode.Update, customer } })

    expect(screen.getByRole('dialog', { name: 'Edit customer details' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Individual name' })).toHaveValue('Jane Doe')
  })

  it('calls onOpenChange when the close button is pressed', async () => {
    const onOpenChange = vi.fn()
    const { user } = renderDrawer({ onOpenChange })

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

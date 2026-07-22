import { type ComponentProps, useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { type Vendor } from '@schemas/vendor'
import { VendorSelector } from '@components/VendorSelector/VendorSelector'

import { get as getAccountingConfig } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { get as getVendors } from '@msw/api/businesses/[business-id]/vendors/get'
import { post as postVendor } from '@msw/api/businesses/[business-id]/vendors/post'
import { server } from '@msw/node'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { makeVendor } from '@fixtures/vendors/mocks'
import { LayerTestProvider } from '@test-utils/LayerTestProvider'

type SelectorProps = Partial<ComponentProps<typeof VendorSelector>>

const renderSelector = (props: SelectorProps = {}, { managementEnabled = true } = {}) => {
  const user = userEvent.setup()
  const onChange = vi.fn()

  server.use(getAccountingConfig.mock(makeAccountingConfiguration({ enableVendorManagement: managementEnabled })))

  function Harness() {
    const [selected, setSelected] = useState<Vendor | null>(null)
    return (
      <VendorSelector
        {...props}
        selectedVendor={selected}
        onSelectedVendorChange={(vendor) => {
          setSelected(vendor)
          onChange(vendor)
        }}
      />
    )
  }

  return { user, onChange, ...render(<Harness />, { wrapper: LayerTestProvider }) }
}

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await waitFor(() => expect(screen.getByLabelText('Vendor')).toBeEnabled())
  const input = screen.getByLabelText('Vendor')
  await user.click(input)
  return input
}

describe('VendorSelector (creatable)', () => {
  it('never offers to create when the consumer opts out', async () => {
    server.use(getVendors.mock([]))
    const { user } = renderSelector({ isCreatable: false })

    const input = await openMenu(user)
    await user.type(input, 'New Co')

    expect(screen.queryByRole('option', { name: /^Create/ })).not.toBeInTheDocument()
  })

  it('never offers to create when vendor management is disabled', async () => {
    server.use(getVendors.mock([]))
    const { user } = renderSelector({ isCreatable: true }, { managementEnabled: false })

    const input = await openMenu(user)
    await user.type(input, 'New Co')

    expect(screen.queryByRole('option', { name: /^Create/ })).not.toBeInTheDocument()
  })

  it('only reveals the create option once a name is typed', async () => {
    server.use(getVendors.mock([]))
    const { user } = renderSelector({ isCreatable: true })

    const input = await openMenu(user)
    expect(await screen.findByText('Type a name to add a vendor')).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /^Create "/ })).not.toBeInTheDocument()

    await user.type(input, 'Acme')
    expect(await screen.findByRole('option', { name: 'Create "Acme"' })).toBeInTheDocument()
  })

  it('creates a vendor from the trimmed company name and selects it', async () => {
    const NEW_VENDOR = makeVendor({ id: '00000000-0000-4000-8000-0000000000d1', individualName: null, companyName: 'Acme Supplies' })
    let createdBody: unknown
    server.use(
      getVendors.mock([]),
      postVendor.mock(NEW_VENDOR, { onRequest: async ({ request }) => { createdBody = await request.json() } }),
    )
    const { user, onChange } = renderSelector({ isCreatable: true })

    const input = await openMenu(user)
    await user.type(input, '  Acme Supplies  ')
    await user.click(await screen.findByRole('option', { name: /^Create "/ }))

    await waitFor(() => expect(createdBody).toEqual({ company_name: 'Acme Supplies' }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: NEW_VENDOR.id }))
    expect(await screen.findByText('Acme Supplies')).toBeInTheDocument()
  })

  it('surfaces an inline error and selects nothing when the create fails', async () => {
    server.use(
      getVendors.mock([]),
      postVendor.mockError({ errors: [{ description: 'nope' }] }),
    )
    const { user, onChange } = renderSelector({ isCreatable: true })

    const input = await openMenu(user)
    await user.type(input, 'Doomed Co')
    await user.click(await screen.findByRole('option', { name: 'Create "Doomed Co"' }))

    expect(await screen.findByText('Could not create vendor. Please try again.')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disables the field while a create is in flight', async () => {
    let releaseCreate: (() => void) | undefined
    const NEW_VENDOR = makeVendor({ id: '00000000-0000-4000-8000-0000000000d2', individualName: null, companyName: 'Slow Co' })
    server.use(
      getVendors.mock([]),
      postVendor.mock(NEW_VENDOR, { onRequest: () => new Promise<void>((resolve) => { releaseCreate = resolve }) }),
    )
    const { user } = renderSelector({ isCreatable: true })

    const input = await openMenu(user)
    await user.type(input, 'Slow Co')
    await user.click(await screen.findByRole('option', { name: 'Create "Slow Co"' }))

    await waitFor(() => expect(screen.getByLabelText('Vendor')).toBeDisabled())
    expect(releaseCreate).toBeDefined()

    releaseCreate?.()
    await waitFor(() => expect(screen.getByText('Slow Co')).toBeInTheDocument())
  })

  it('delegates to onCreateVendor without calling the API, and offers create with no typed name', async () => {
    let apiCalled = false
    const onCreateVendor = vi.fn()
    server.use(
      getVendors.mock([]),
      postVendor.mock(makeVendor(), { onRequest: () => { apiCalled = true } }),
    )
    const { user } = renderSelector({ isCreatable: true, onCreateVendor })

    await openMenu(user)
    await user.click(await screen.findByRole('option', { name: 'Create new vendor' }))

    expect(onCreateVendor).toHaveBeenCalledTimes(1)
    expect(apiCalled).toBe(false)
  })
})

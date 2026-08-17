import { afterEach, describe, expect, it, vi } from 'vitest'

import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'

import { post as postSandboxResetPlaidItemLogin } from '@msw/api/businesses/[business-id]/plaid/items/[plaid-item-id]/sandbox-reset-item-login/post'
import { post as postUnlinkPlaidItem } from '@msw/api/businesses/[business-id]/plaid/items/[plaid-item-id]/unlink/post'
import { post as postPlaidLink } from '@msw/api/businesses/[business-id]/plaid/link/post'
import { post as postPlaidUpdateModeLink } from '@msw/api/businesses/[business-id]/plaid/update-mode-link/post'
import { makeCustomerManagedPlaidConfig } from '@testUtils/mocks/customerManagedPlaidConfig'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'
import { spyOnEndpoint } from '@testUtils/requests/spyOnEndpoint'

// `ready: false` keeps the hook from auto-opening the widget.
vi.mock('react-plaid-link', () => ({
  usePlaidLink: () => ({ open: vi.fn(), ready: false }),
}))

const renderLinkedAccounts = (customerManagedPlaidConfig?: CustomerManagedPlaidConfig) =>
  renderHookWithAuth(() => useLinkedAccounts({ customerManagedPlaidConfig }))

afterEach(() => vi.restoreAllMocks())

describe('useLinkedAccounts with a customer-managed Plaid config', () => {
  it('mints the add-flow link token through the customer, not Layer', async () => {
    const createPlaidLink = spyOnEndpoint(postPlaidLink)
    const customerManagedPlaidConfig = makeCustomerManagedPlaidConfig()

    const { result } = await renderLinkedAccounts(customerManagedPlaidConfig)

    await result.current.addConnection('PLAID')

    expect(customerManagedPlaidConfig.createLinkToken).toHaveBeenCalledOnce()
    expect(createPlaidLink).not.toHaveBeenCalled()
  })

  it('mints the repair link token through the customer, passing the connection id', async () => {
    const createPlaidUpdateModeLink = spyOnEndpoint(postPlaidUpdateModeLink)
    const customerManagedPlaidConfig = makeCustomerManagedPlaidConfig()

    const { result } = await renderLinkedAccounts(customerManagedPlaidConfig)

    await result.current.repairConnection('PLAID', 'plaid-item-id')

    expect(customerManagedPlaidConfig.createUpdateModeLinkToken).toHaveBeenCalledWith('plaid-item-id')
    expect(createPlaidUpdateModeLink).not.toHaveBeenCalled()
  })

  it('does not attempt item-level unlink, which needs Layer-owned Plaid credentials', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const unlinkPlaidItem = spyOnEndpoint(postUnlinkPlaidItem)

    const { result } = await renderLinkedAccounts(makeCustomerManagedPlaidConfig())

    await result.current.removeConnection('PLAID', 'plaid-item-id')

    expect(unlinkPlaidItem).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledOnce()
  })

  it('does not attempt the sandbox break-connection utility', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const resetPlaidItemLogin = spyOnEndpoint(postSandboxResetPlaidItemLogin)

    const { result } = await renderLinkedAccounts(makeCustomerManagedPlaidConfig())

    await result.current.breakConnection('PLAID', 'plaid-item-id')

    expect(resetPlaidItemLogin).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledOnce()
  })

  it('rejects a hosted-link config supplied alongside it', async () => {
    // React logs the render failure before rethrowing it.
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(
      renderHookWithAuth(() => useLinkedAccounts({
        customerManagedPlaidConfig: makeCustomerManagedPlaidConfig(),
        plaidHostedLinkConfig: { navigateToHostedLink: () => undefined },
      })),
    ).rejects.toThrow('mutually exclusive')
  })
})

describe('useLinkedAccounts without a customer-managed Plaid config', () => {
  it('still mints the add-flow link token through Layer', async () => {
    const createPlaidLink = spyOnEndpoint(postPlaidLink)

    const { result } = await renderLinkedAccounts()

    await result.current.addConnection('PLAID')

    expect(createPlaidLink).toHaveBeenCalledOnce()
  })

  it('still mints the repair link token through Layer', async () => {
    const createPlaidUpdateModeLink = spyOnEndpoint(postPlaidUpdateModeLink)

    const { result } = await renderLinkedAccounts()

    await result.current.repairConnection('PLAID', 'plaid-item-id')

    expect(createPlaidUpdateModeLink).toHaveBeenCalledWith(
      expect.objectContaining({ body: { plaid_item_id: 'plaid-item-id' } }),
    )
  })

  it('still unlinks the item through Layer', async () => {
    const unlinkPlaidItem = spyOnEndpoint(postUnlinkPlaidItem)

    const { result } = await renderLinkedAccounts()

    await result.current.removeConnection('PLAID', 'plaid-item-id')

    expect(unlinkPlaidItem).toHaveBeenCalledOnce()
  })
})

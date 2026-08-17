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

// `connectionExternalId` is the Plaid item id for a Layer-managed connection and the processor
// token for a customer-managed one, so each suite passes the id its mode would really carry.
const PLAID_ITEM_ID = 'plaid-item-id'
const PROCESSOR_TOKEN = 'processor-sandbox-0a1b2c3d-4e5f'

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

    await result.current.repairConnection('PLAID', PROCESSOR_TOKEN)

    expect(customerManagedPlaidConfig.createUpdateModeLinkToken).toHaveBeenCalledWith(PROCESSOR_TOKEN)
    expect(createPlaidUpdateModeLink).not.toHaveBeenCalled()
  })

  it('does not attempt item-level unlink, which needs Layer-owned Plaid credentials', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const unlinkPlaidItem = spyOnEndpoint(postUnlinkPlaidItem)

    const { result } = await renderLinkedAccounts(makeCustomerManagedPlaidConfig())

    await result.current.removeConnection('PLAID', PROCESSOR_TOKEN)

    expect(unlinkPlaidItem).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledOnce()
  })

  it('does not attempt the sandbox break-connection utility', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const resetPlaidItemLogin = spyOnEndpoint(postSandboxResetPlaidItemLogin)

    const { result } = await renderLinkedAccounts(makeCustomerManagedPlaidConfig())

    await result.current.breakConnection('PLAID', PROCESSOR_TOKEN)

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

    await result.current.repairConnection('PLAID', PLAID_ITEM_ID)

    expect(createPlaidUpdateModeLink).toHaveBeenCalledWith(
      expect.objectContaining({ body: { plaid_item_id: PLAID_ITEM_ID } }),
    )
  })

  it('still unlinks the item through Layer', async () => {
    const unlinkPlaidItem = spyOnEndpoint(postUnlinkPlaidItem)

    const { result } = await renderLinkedAccounts()

    await result.current.removeConnection('PLAID', PLAID_ITEM_ID)

    expect(unlinkPlaidItem).toHaveBeenCalledOnce()
  })
})

import { act } from '@testing-library/react'
import type { HttpHandler, PathParams } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'

import { post as postSandboxResetPlaidItemLogin } from '@msw/api/businesses/[business-id]/plaid/items/[plaid-item-id]/sandbox-reset-item-login/post'
import { post as postUnlinkPlaidItem } from '@msw/api/businesses/[business-id]/plaid/items/[plaid-item-id]/unlink/post'
import { post as postPlaidLink } from '@msw/api/businesses/[business-id]/plaid/link/post'
import { post as postPlaidUpdateModeLink } from '@msw/api/businesses/[business-id]/plaid/update-mode-link/post'
import { server } from '@msw/node'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

// The widget itself is out of scope here; `ready: false` keeps it from auto-opening.
vi.mock('react-plaid-link', () => ({
  usePlaidLink: () => ({ open: vi.fn(), ready: false }),
}))

type RequestSpy = (record: { params: PathParams, body: unknown }) => void

type MockableEndpoint = {
  mock: (
    override: undefined,
    options: { onRequest: (context: { request: Request, params: PathParams }) => Promise<void> },
  ) => HttpHandler
}

/**
 * Swaps in a runtime handler that records each call, so a test can assert an endpoint
 * fired — or, for a customer-managed connection, that Layer never called it at all.
 *
 * Not `readRequestJson`: some of these endpoints send no body at all.
 */
const spyOnEndpoint = (endpoint: MockableEndpoint) => {
  const onRequest = vi.fn<RequestSpy>()

  server.use(endpoint.mock(undefined, {
    onRequest: async ({ request, params }) => {
      const body = await request.text()
      onRequest({ params, body: body ? JSON.parse(body) : undefined })
    },
  }))

  return onRequest
}

const makeCustomerManagedPlaidConfig = (): CustomerManagedPlaidConfig => ({
  createLinkToken: vi.fn(() => Promise.resolve({ linkToken: 'customer-link-token' })),
  createUpdateModeLinkToken: vi.fn(() => Promise.resolve({ linkToken: 'customer-update-token' })),
  onPublicTokenReceived: vi.fn(() => Promise.resolve()),
})

const renderLinkedAccounts = (customerManagedPlaidConfig?: CustomerManagedPlaidConfig) =>
  renderHookWithAuth(() => useLinkedAccounts({ customerManagedPlaidConfig }))

afterEach(() => vi.restoreAllMocks())

describe('useLinkedAccounts with a customer-managed Plaid config', () => {
  it('mints the add-flow link token through the customer, not Layer', async () => {
    const createPlaidLink = spyOnEndpoint(postPlaidLink)
    const customerManagedPlaidConfig = makeCustomerManagedPlaidConfig()

    const { result } = await renderLinkedAccounts(customerManagedPlaidConfig)

    await act(async () => {
      await result.current.addConnection('PLAID')
    })

    expect(customerManagedPlaidConfig.createLinkToken).toHaveBeenCalledOnce()
    expect(createPlaidLink).not.toHaveBeenCalled()
  })

  it('mints the repair link token through the customer, passing the connection id', async () => {
    const createPlaidUpdateModeLink = spyOnEndpoint(postPlaidUpdateModeLink)
    const customerManagedPlaidConfig = makeCustomerManagedPlaidConfig()

    const { result } = await renderLinkedAccounts(customerManagedPlaidConfig)

    await act(async () => {
      await result.current.repairConnection('PLAID', 'plaid-item-id')
    })

    expect(customerManagedPlaidConfig.createUpdateModeLinkToken).toHaveBeenCalledWith('plaid-item-id')
    expect(createPlaidUpdateModeLink).not.toHaveBeenCalled()
  })

  it('does not attempt item-level unlink, which needs Layer-owned Plaid credentials', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const unlinkPlaidItem = spyOnEndpoint(postUnlinkPlaidItem)

    const { result } = await renderLinkedAccounts(makeCustomerManagedPlaidConfig())

    await act(async () => {
      await result.current.removeConnection('PLAID', 'plaid-item-id')
    })

    expect(unlinkPlaidItem).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledOnce()
  })

  it('does not attempt the sandbox break-connection utility', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const resetPlaidItemLogin = spyOnEndpoint(postSandboxResetPlaidItemLogin)

    const { result } = await renderLinkedAccounts(makeCustomerManagedPlaidConfig())

    await act(async () => {
      await result.current.breakConnection('PLAID', 'plaid-item-id')
    })

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

    await act(async () => {
      await result.current.addConnection('PLAID')
    })

    expect(createPlaidLink).toHaveBeenCalledOnce()
  })

  it('still mints the repair link token through Layer', async () => {
    const createPlaidUpdateModeLink = spyOnEndpoint(postPlaidUpdateModeLink)

    const { result } = await renderLinkedAccounts()

    await act(async () => {
      await result.current.repairConnection('PLAID', 'plaid-item-id')
    })

    expect(createPlaidUpdateModeLink).toHaveBeenCalledWith(
      expect.objectContaining({ body: { plaid_item_id: 'plaid-item-id' } }),
    )
  })

  it('still unlinks the item through Layer', async () => {
    const unlinkPlaidItem = spyOnEndpoint(postUnlinkPlaidItem)

    const { result } = await renderLinkedAccounts()

    await act(async () => {
      await result.current.removeConnection('PLAID', 'plaid-item-id')
    })

    expect(unlinkPlaidItem).toHaveBeenCalledOnce()
  })
})

import { act, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'

import { server } from '@msw/node'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

vi.mock('react-plaid-link', () => ({
  usePlaidLink: () => ({ open: vi.fn(), ready: false }),
}))

const makeCustomerManagedPlaidConfig = (): CustomerManagedPlaidConfig => ({
  createLinkToken: vi.fn(() => Promise.resolve({ linkToken: 'customer-link-token' })),
  createUpdateModeLinkToken: vi.fn(() => Promise.resolve({ linkToken: 'customer-update-token' })),
  onPublicTokenReceived: vi.fn(() => Promise.resolve()),
})

let requestedPaths: string[]

const recordPath = ({ request }: { request: Request }) => {
  requestedPaths.push(new URL(request.url).pathname)
}

beforeEach(() => {
  requestedPaths = []
  server.events.on('request:start', recordPath)
})

afterEach(() => {
  server.events.removeListener('request:start', recordPath)
  vi.restoreAllMocks()
})

const requestedPathsMatching = (fragment: string) =>
  requestedPaths.filter(path => path.includes(fragment))

describe('useLinkedAccounts with a customer-managed Plaid config', () => {
  it('mints the add-flow link token through the customer, not Layer', async () => {
    const customerManagedPlaidConfig = makeCustomerManagedPlaidConfig()

    const { result } = await renderHookWithAuth(() => useLinkedAccounts({ customerManagedPlaidConfig }))

    await act(async () => {
      await result.current.addConnection('PLAID')
    })

    expect(customerManagedPlaidConfig.createLinkToken).toHaveBeenCalledTimes(1)
    expect(requestedPathsMatching('/plaid/link')).toHaveLength(0)
  })

  it('mints the repair link token through the customer, passing the connection id', async () => {
    const customerManagedPlaidConfig = makeCustomerManagedPlaidConfig()

    const { result } = await renderHookWithAuth(() => useLinkedAccounts({ customerManagedPlaidConfig }))

    await act(async () => {
      await result.current.repairConnection('PLAID', 'plaid-item-id')
    })

    expect(customerManagedPlaidConfig.createUpdateModeLinkToken).toHaveBeenCalledWith('plaid-item-id')
    expect(requestedPathsMatching('/plaid/update-mode-link')).toHaveLength(0)
  })

  it('does not attempt item-level unlink, which needs Layer-owned Plaid credentials', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { result } = await renderHookWithAuth(
      () => useLinkedAccounts({ customerManagedPlaidConfig: makeCustomerManagedPlaidConfig() }),
    )

    await act(async () => {
      await result.current.removeConnection('PLAID', 'plaid-item-id')
    })

    expect(requestedPathsMatching('/unlink')).toHaveLength(0)
    expect(consoleError).toHaveBeenCalledOnce()
  })

  it('does not attempt the sandbox break-connection utility', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { result } = await renderHookWithAuth(
      () => useLinkedAccounts({ customerManagedPlaidConfig: makeCustomerManagedPlaidConfig() }),
    )

    await act(async () => {
      await result.current.breakConnection('PLAID', 'plaid-item-id')
    })

    expect(requestedPathsMatching('/sandbox-reset-item-login')).toHaveLength(0)
    expect(consoleError).toHaveBeenCalledOnce()
  })

  it('rejects a hosted-link config supplied alongside it', async () => {
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
    const { result } = await renderHookWithAuth(() => useLinkedAccounts())

    await act(async () => {
      await result.current.addConnection('PLAID')
    })

    await waitFor(() => expect(requestedPathsMatching('/plaid/link')).not.toHaveLength(0))
  })
})

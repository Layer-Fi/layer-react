import { type PropsWithChildren } from 'react'
import { act, waitFor } from '@testing-library/react'
import type { PlaidLinkOnSuccessMetadata, PlaidLinkOptions } from 'react-plaid-link'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { usePlaidLinkModal } from '@hooks/features/linkedAccounts/usePlaidLinkModal'

import { post as postExchangePlaidPublicToken } from '@msw/api/businesses/[business-id]/plaid/link/exchange/post'
import { server } from '@msw/node'
import { readRequestJson } from '@msw/utils/request'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

// `env` is absent from the link-token variant of PlaidLinkOptions, but the hook still forwards it.
type CapturedPlaidLinkOptions = PlaidLinkOptions & { env?: string }

const plaidLinkOptions: CapturedPlaidLinkOptions[] = []

vi.mock('react-plaid-link', () => ({
  usePlaidLink: (options: CapturedPlaidLinkOptions) => {
    plaidLinkOptions.push(options)
    return { open: vi.fn(), ready: false }
  },
}))

const latestPlaidLinkOptions = () => plaidLinkOptions[plaidLinkOptions.length - 1]

const METADATA = { institution: { name: 'Test Bank', institution_id: 'ins_1' } } as PlaidLinkOnSuccessMetadata

const completePlaidLink = () =>
  act(() => {
    latestPlaidLinkOptions().onSuccess('public-token', METADATA)
    return Promise.resolve()
  })

const spyOnExchangePlaidPublicToken = () => {
  const onRequest = vi.fn<(body: unknown) => void>()

  server.use(postExchangePlaidPublicToken.mock(undefined, {
    onRequest: async ({ request }) => onRequest(await readRequestJson(request)),
  }))

  return onRequest
}

const makeCustomerManagedPlaidConfig = (
  overrides?: Partial<CustomerManagedPlaidConfig>,
): CustomerManagedPlaidConfig => ({
  createLinkToken: vi.fn(() => Promise.resolve({ linkToken: 'customer-link-token' })),
  createUpdateModeLinkToken: vi.fn(() => Promise.resolve({ linkToken: 'customer-update-token' })),
  onPublicTokenReceived: vi.fn(() => Promise.resolve()),
  ...overrides,
})

const sandboxWrapper = ({ children }: PropsWithChildren) => (
  <LayerTestProvider usePlaidSandbox>{children}</LayerTestProvider>
)

const renderAddModeModal = (customerManagedPlaidConfig?: CustomerManagedPlaidConfig, sandbox = false) =>
  renderHookWithAuth(
    () => usePlaidLinkModal({
      linkToken: 'a-link-token',
      linkMode: 'add',
      setLinkMode: vi.fn(),
      onSuccess: vi.fn(),
      customerManagedPlaidConfig,
    }),
    sandbox ? { wrapper: sandboxWrapper } : undefined,
  )

beforeEach(() => {
  plaidLinkOptions.length = 0
})

afterEach(() => vi.restoreAllMocks())

describe('usePlaidLinkModal with a customer-managed Plaid config', () => {
  it('hands the public token to the customer instead of exchanging it with Layer', async () => {
    const exchangePlaidPublicToken = spyOnExchangePlaidPublicToken()
    const customerManagedPlaidConfig = makeCustomerManagedPlaidConfig()

    const { result } = await renderAddModeModal(customerManagedPlaidConfig)

    await completePlaidLink()

    await waitFor(() => expect(customerManagedPlaidConfig.onPublicTokenReceived).toHaveBeenCalledWith({
      publicToken: 'public-token',
      metadata: METADATA,
    }))

    expect(exchangePlaidPublicToken).not.toHaveBeenCalled()
    await waitFor(() => expect(result.current.isLinking).toBe(false))
  })

  it('leaves the Plaid environment to the customer-minted token', async () => {
    await renderAddModeModal(makeCustomerManagedPlaidConfig(), true)

    expect(latestPlaidLinkOptions().env).toBeUndefined()
  })

  it('stops linking when the customer callback rejects', async () => {
    const { result } = await renderAddModeModal(makeCustomerManagedPlaidConfig({
      onPublicTokenReceived: vi.fn(() => Promise.reject(new Error('customer backend is down'))),
    }))

    await completePlaidLink()

    await waitFor(() => expect(result.current.isLinking).toBe(false))
  })

  it('stops linking when the customer callback throws synchronously', async () => {
    const { result } = await renderAddModeModal(makeCustomerManagedPlaidConfig({
      onPublicTokenReceived: vi.fn(() => {
        throw new Error('customer backend is down')
      }),
    }))

    await completePlaidLink()

    await waitFor(() => expect(result.current.isLinking).toBe(false))
  })
})

describe('usePlaidLinkModal without a customer-managed Plaid config', () => {
  it('exchanges the public token with Layer', async () => {
    const exchangePlaidPublicToken = spyOnExchangePlaidPublicToken()

    await renderAddModeModal()

    await completePlaidLink()

    await waitFor(() => expect(exchangePlaidPublicToken).toHaveBeenCalledWith({
      public_token: 'public-token',
      institution: METADATA.institution,
    }))
  })

  it('opts into the Plaid sandbox environment', async () => {
    await renderAddModeModal(undefined, true)

    expect(latestPlaidLinkOptions().env).toBe('sandbox')
  })
})

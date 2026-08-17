import { type PropsWithChildren } from 'react'
import { act, waitFor } from '@testing-library/react'
import { type PlaidLinkOnSuccessMetadata, type PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { usePlaidLinkModal } from '@hooks/features/linkedAccounts/usePlaidLinkModal'

import { post as postExchangePlaidPublicToken } from '@msw/api/businesses/[business-id]/plaid/link/exchange/post'
import { makeCustomerManagedPlaidConfig } from '@testUtils/mocks/customerManagedPlaidConfig'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'
import { spyOnEndpoint } from '@testUtils/requests/spyOnEndpoint'

vi.mock('react-plaid-link', () => ({ usePlaidLink: vi.fn() }))

const mockedUsePlaidLink = vi.mocked(usePlaidLink)

// `env` is absent from the link-token variant of PlaidLinkOptions, but the hook still forwards it.
const lastPlaidLinkOptions = () =>
  mockedUsePlaidLink.mock.lastCall?.[0] as PlaidLinkOptions & { env?: string }

const METADATA = { institution: { name: 'Test Bank', institution_id: 'ins_1' } } as PlaidLinkOnSuccessMetadata

const completePlaidLink = () =>
  act(() => {
    lastPlaidLinkOptions().onSuccess('public-token', METADATA)
    return Promise.resolve()
  })

type RenderAddModeModalOptions = {
  customerManagedPlaidConfig?: CustomerManagedPlaidConfig
  usePlaidSandbox?: boolean
}

const renderAddModeModal = ({
  customerManagedPlaidConfig,
  usePlaidSandbox = false,
}: RenderAddModeModalOptions = {}) =>
  renderHookWithAuth(
    () => usePlaidLinkModal({
      linkToken: 'a-link-token',
      linkMode: 'add',
      setLinkMode: vi.fn(),
      onSuccess: vi.fn(),
      customerManagedPlaidConfig,
    }),
    {
      wrapper: ({ children }: PropsWithChildren) => (
        <LayerTestProvider usePlaidSandbox={usePlaidSandbox}>{children}</LayerTestProvider>
      ),
    },
  )

// `mockReset` because vitest keeps call history between tests, and `lastCall` is what these
// assertions read. `ready: false` keeps the hook from auto-opening the widget.
beforeEach(() => {
  mockedUsePlaidLink.mockReset()
  mockedUsePlaidLink.mockReturnValue(
    { open: vi.fn(), ready: false } as unknown as ReturnType<typeof usePlaidLink>,
  )
})

afterEach(() => vi.restoreAllMocks())

describe('usePlaidLinkModal with a customer-managed Plaid config', () => {
  it('hands the public token to the customer instead of exchanging it with Layer', async () => {
    const exchangePlaidPublicToken = spyOnEndpoint(postExchangePlaidPublicToken)
    const customerManagedPlaidConfig = makeCustomerManagedPlaidConfig()

    const { result } = await renderAddModeModal({ customerManagedPlaidConfig })

    await completePlaidLink()

    await waitFor(() => expect(customerManagedPlaidConfig.onPublicTokenReceived).toHaveBeenCalledWith({
      publicToken: 'public-token',
      metadata: METADATA,
    }))

    expect(exchangePlaidPublicToken).not.toHaveBeenCalled()
    await waitFor(() => expect(result.current.isLinking).toBe(false))
  })

  it('leaves the Plaid environment to the customer-minted token', async () => {
    await renderAddModeModal({
      customerManagedPlaidConfig: makeCustomerManagedPlaidConfig(),
      usePlaidSandbox: true,
    })

    expect(lastPlaidLinkOptions().env).toBeUndefined()
  })

  it('stops linking when the customer callback rejects', async () => {
    const { result } = await renderAddModeModal({
      customerManagedPlaidConfig: makeCustomerManagedPlaidConfig({
        onPublicTokenReceived: vi.fn(() => Promise.reject(new Error('customer backend is down'))),
      }),
    })

    await completePlaidLink()

    await waitFor(() => expect(result.current.isLinking).toBe(false))
  })

  it('stops linking when the customer callback throws synchronously', async () => {
    const { result } = await renderAddModeModal({
      customerManagedPlaidConfig: makeCustomerManagedPlaidConfig({
        onPublicTokenReceived: vi.fn(() => {
          throw new Error('customer backend is down')
        }),
      }),
    })

    await completePlaidLink()

    await waitFor(() => expect(result.current.isLinking).toBe(false))
  })
})

describe('usePlaidLinkModal without a customer-managed Plaid config', () => {
  it('exchanges the public token with Layer', async () => {
    const exchangePlaidPublicToken = spyOnEndpoint(postExchangePlaidPublicToken)

    await renderAddModeModal()

    await completePlaidLink()

    await waitFor(() => expect(exchangePlaidPublicToken).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          public_token: 'public-token',
          institution: METADATA.institution,
        },
      }),
    ))
  })

  it('opts into the Plaid sandbox environment', async () => {
    await renderAddModeModal({ usePlaidSandbox: true })

    expect(lastPlaidLinkOptions().env).toBe('sandbox')
  })
})

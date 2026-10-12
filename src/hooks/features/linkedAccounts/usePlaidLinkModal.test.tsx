import { type PropsWithChildren } from 'react'
import { act, waitFor } from '@testing-library/react'
import { type PlaidLinkOnExitMetadata, type PlaidLinkOnSuccessMetadata, type PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
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

const closePlaidLink = () =>
  act(() => {
    lastPlaidLinkOptions().onExit?.(null, {} as PlaidLinkOnExitMetadata)
  })

const mockPlaidLink = (state: { ready?: boolean, error?: ErrorEvent | null } = {}) =>
  mockedUsePlaidLink.mockReturnValue(
    { open: vi.fn(), ready: false, error: null, ...state } as unknown as ReturnType<typeof usePlaidLink>,
  )

type RenderAddModeModalOptions = {
  customerManagedPlaidConfig?: CustomerManagedPlaidConfig
  usePlaidSandbox?: boolean
}

const renderAddModeModal = async ({
  customerManagedPlaidConfig,
  usePlaidSandbox = false,
}: RenderAddModeModalOptions = {}) => {
  const rendered = await renderHookWithAuth(
    () => usePlaidLinkModal({ onSuccess: vi.fn(), customerManagedPlaidConfig }),
    {
      wrapper: ({ children }: PropsWithChildren) => (
        <LayerTestProvider usePlaidSandbox={usePlaidSandbox}>{children}</LayerTestProvider>
      ),
    },
  )

  let session: Promise<boolean> = Promise.resolve(false)
  act(() => {
    session = rendered.result.current.openLink('a-link-token', 'add')
  })

  return { ...rendered, session }
}

beforeEach(() => {
  mockedUsePlaidLink.mockReset()
  mockPlaidLink()
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

describe('usePlaidLinkModal sessions', () => {
  it('resolves true once the connection is saved and clears the token', async () => {
    const { session } = await renderAddModeModal()
    expect(lastPlaidLinkOptions().token).toBe('a-link-token')

    await completePlaidLink()

    await expect(session).resolves.toBe(true)
    expect(lastPlaidLinkOptions().token).toBeNull()
  })

  it('ignores the exit Plaid sends after a successful Link while the token is still being saved', async () => {
    mockPlaidLink({ ready: true })
    const { session } = await renderAddModeModal()
    const { onExit } = lastPlaidLinkOptions()

    await completePlaidLink()
    act(() => {
      onExit?.(null, {} as PlaidLinkOnExitMetadata)
    })

    await expect(session).resolves.toBe(true)
  })

  it('resolves false when Link closes', async () => {
    mockPlaidLink({ ready: true })
    const { session } = await renderAddModeModal()

    closePlaidLink()

    await expect(session).resolves.toBe(false)
    expect(lastPlaidLinkOptions().token).toBeNull()
  })

  it('resolves false when the public token couldn’t be saved', async () => {
    const { session } = await renderAddModeModal({
      customerManagedPlaidConfig: makeCustomerManagedPlaidConfig({
        onPublicTokenReceived: vi.fn(() => Promise.reject(new Error('customer backend is down'))),
      }),
    })

    await completePlaidLink()

    await expect(session).resolves.toBe(false)
  })

  it('resolves false when Plaid fails to load after the session started', async () => {
    const { session, rerender } = await renderAddModeModal()

    mockPlaidLink({ error: new ErrorEvent('error') })
    rerender()

    await expect(session).resolves.toBe(false)
    expect(lastPlaidLinkOptions().token).toBeNull()
  })

  it('turns away a second session while one is open', async () => {
    const { result } = await renderAddModeModal()

    await expect(result.current.openLink('another-token', 'add')).resolves.toBe(false)
    expect(lastPlaidLinkOptions().token).toBe('a-link-token')
  })
})

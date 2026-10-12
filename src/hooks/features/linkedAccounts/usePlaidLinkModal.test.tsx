import { type PropsWithChildren } from 'react'
import { act, waitFor } from '@testing-library/react'
import { type PlaidLinkError as PlaidLinkExitError, type PlaidLinkOnExitMetadata, type PlaidLinkOnSuccessMetadata, type PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type LayerEvent, LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { type LinkMode, usePlaidLinkModal } from '@hooks/features/linkedAccounts/usePlaidLinkModal'

import { post as postExchangePlaidPublicToken } from '@msw/api/businesses/[business-id]/plaid/link/exchange/post'
import { post as postPlaidLinkOutcome } from '@msw/api/businesses/[business-id]/plaid/link/outcome/post'
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

const EXIT_METADATA: PlaidLinkOnExitMetadata = {
  institution: { name: 'Test Bank', institution_id: 'ins_1' },
  status: 'requires_credentials',
  link_session_id: 'link-session-1',
  request_id: 'request-1',
}

const INVALID_CREDENTIALS: PlaidLinkExitError = {
  error_type: 'ITEM_ERROR',
  error_code: 'INVALID_CREDENTIALS',
  error_message: 'the provided credentials were not correct',
  display_message: 'The credentials you entered were incorrect.',
}

const exitPlaidLink = (error: PlaidLinkExitError | null) =>
  act(() => {
    lastPlaidLinkOptions().onExit?.(error, EXIT_METADATA)
    return Promise.resolve()
  })

type RenderModalOptions = {
  linkMode?: LinkMode
  setLinkMode?: (mode: LinkMode) => void
  onEvent?: (event: LayerEvent) => void
}

const renderModal = ({ linkMode = 'add', setLinkMode = vi.fn(), onEvent }: RenderModalOptions = {}) =>
  renderHookWithAuth(
    () => usePlaidLinkModal({
      linkToken: 'a-link-token',
      linkMode,
      setLinkMode,
      onSuccess: vi.fn(),
    }),
    {
      wrapper: ({ children }: PropsWithChildren) => (
        <LayerTestProvider eventCallbacks={onEvent ? { onEvent } : undefined}>{children}</LayerTestProvider>
      ),
    },
  )

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

const linkFinishedEvent = (payload: Record<string, unknown>) => expect.objectContaining({
  type: LayerEventType.LinkedAccountsLinkFinished,
  version: 1,
  payload,
  metadata: expect.objectContaining({ component: LayerEventComponent.LinkedAccounts }) as object,
}) as LayerEvent

describe('usePlaidLinkModal Link outcomes', () => {
  it('reports and emits a completed Link session', async () => {
    const reportOutcome = spyOnEndpoint(postPlaidLinkOutcome)
    const onEvent = vi.fn<(event: LayerEvent) => void>()

    await renderModal({ onEvent })

    await act(() => {
      lastPlaidLinkOptions().onSuccess('public-token', { ...METADATA, link_session_id: 'link-session-1' })
      return Promise.resolve()
    })

    await waitFor(() => expect(reportOutcome).toHaveBeenCalledWith(
      expect.objectContaining({ body: { outcome: 'COMPLETED' } }),
    ))
    expect(onEvent).toHaveBeenCalledWith(linkFinishedEvent({
      provider: 'PLAID',
      outcome: 'completed',
      linkMode: 'add',
      linkSessionId: 'link-session-1',
      institution: { id: 'ins_1', name: 'Test Bank' },
      exitStatus: null,
      error: null,
    }))
  })

  it('reports and emits an exit when the user closes Link', async () => {
    const reportOutcome = spyOnEndpoint(postPlaidLinkOutcome)
    const onEvent = vi.fn<(event: LayerEvent) => void>()
    const setLinkMode = vi.fn()

    await renderModal({ linkMode: 'update', setLinkMode, onEvent })

    await exitPlaidLink(null)

    await waitFor(() => expect(reportOutcome).toHaveBeenCalledWith(
      expect.objectContaining({ body: { outcome: 'EXITED' } }),
    ))
    expect(onEvent).toHaveBeenCalledWith(linkFinishedEvent({
      provider: 'PLAID',
      outcome: 'exited',
      linkMode: 'update',
      linkSessionId: 'link-session-1',
      institution: { id: 'ins_1', name: 'Test Bank' },
      exitStatus: 'requires_credentials',
      error: null,
    }))
    expect(setLinkMode).toHaveBeenCalledWith('add')
  })

  it('reports the Plaid error code and emits the Link error', async () => {
    const reportOutcome = spyOnEndpoint(postPlaidLinkOutcome)
    const onEvent = vi.fn<(event: LayerEvent) => void>()

    await renderModal({ linkMode: 'update', onEvent })

    await exitPlaidLink(INVALID_CREDENTIALS)

    await waitFor(() => expect(reportOutcome).toHaveBeenCalledWith(
      expect.objectContaining({ body: { outcome: 'ERROR', error_code: 'INVALID_CREDENTIALS' } }),
    ))
    expect(onEvent).toHaveBeenCalledWith(linkFinishedEvent({
      provider: 'PLAID',
      outcome: 'error',
      linkMode: 'update',
      linkSessionId: 'link-session-1',
      institution: { id: 'ins_1', name: 'Test Bank' },
      exitStatus: 'requires_credentials',
      error: {
        type: 'ITEM_ERROR',
        code: 'INVALID_CREDENTIALS',
        message: INVALID_CREDENTIALS.error_message,
        displayMessage: INVALID_CREDENTIALS.display_message,
      },
    }))
  })

  it('emits an empty Plaid display message as null', async () => {
    const onEvent = vi.fn<(event: LayerEvent) => void>()

    await renderModal({ onEvent })

    await exitPlaidLink({
      error_type: 'API_ERROR',
      error_code: 'INTERNAL_SERVER_ERROR',
      error_message: 'an unexpected error occurred',
      display_message: '',
    })

    expect(onEvent).toHaveBeenCalledWith(linkFinishedEvent(expect.objectContaining({
      error: expect.objectContaining({ code: 'INTERNAL_SERVER_ERROR', displayMessage: null }) as object,
    }) as Record<string, unknown>))
  })
})

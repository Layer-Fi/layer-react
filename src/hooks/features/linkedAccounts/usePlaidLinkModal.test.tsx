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

const completePlaidLink = () =>
  act(() => {
    lastPlaidLinkOptions().onSuccess('public-token', METADATA)
    return Promise.resolve()
  })

const exitPlaidLink = (error: PlaidLinkExitError | null = null, onExit = lastPlaidLinkOptions().onExit) =>
  act(() => {
    onExit?.(error, EXIT_METADATA)
    return Promise.resolve()
  })

const mockPlaidLink = (error: ErrorEvent | null = null) =>
  mockedUsePlaidLink.mockReturnValue({ open: vi.fn(), exit: vi.fn(), submit: vi.fn(), ready: false, error })

type RenderPlaidLinkModalOptions = {
  mode?: LinkMode
  customerManagedPlaidConfig?: CustomerManagedPlaidConfig
  usePlaidSandbox?: boolean
  onEvent?: (event: LayerEvent) => void
}

const renderPlaidLinkModal = async ({
  mode = 'add',
  customerManagedPlaidConfig,
  usePlaidSandbox = false,
  onEvent,
}: RenderPlaidLinkModalOptions = {}) => {
  const rendered = await renderHookWithAuth(
    () => usePlaidLinkModal({ onSuccess: vi.fn(), customerManagedPlaidConfig }),
    {
      wrapper: ({ children }: PropsWithChildren) => (
        <LayerTestProvider usePlaidSandbox={usePlaidSandbox} eventCallbacks={onEvent ? { onEvent } : undefined}>{children}</LayerTestProvider>
      ),
    },
  )

  let session: Promise<boolean> = Promise.resolve(false)
  act(() => {
    session = rendered.result.current.openLink('a-link-token', mode)
  })

  return { ...rendered, session }
}

const linkFinishedEvent = (payload: Record<string, unknown>) => expect.objectContaining({
  type: LayerEventType.LinkedAccountsLinkFinished,
  version: 1,
  payload,
  metadata: expect.objectContaining({ component: LayerEventComponent.LinkedAccounts }) as object,
}) as LayerEvent

beforeEach(() => {
  mockedUsePlaidLink.mockReset()
  mockPlaidLink()
})

afterEach(() => vi.restoreAllMocks())

describe('usePlaidLinkModal', () => {
  describe('with a customer-managed Plaid config', () => {
    it('hands the public token to the customer instead of exchanging it with Layer', async () => {
      const exchangePlaidPublicToken = spyOnEndpoint(postExchangePlaidPublicToken)
      const customerManagedPlaidConfig = makeCustomerManagedPlaidConfig()

      const { result } = await renderPlaidLinkModal({ customerManagedPlaidConfig })

      await completePlaidLink()

      await waitFor(() => expect(customerManagedPlaidConfig.onPublicTokenReceived).toHaveBeenCalledWith({
        publicToken: 'public-token',
        metadata: METADATA,
      }))

      expect(exchangePlaidPublicToken).not.toHaveBeenCalled()
      await waitFor(() => expect(result.current.isLinking).toBe(false))
    })

    it('leaves the Plaid environment to the customer-minted token', async () => {
      await renderPlaidLinkModal({
        customerManagedPlaidConfig: makeCustomerManagedPlaidConfig(),
        usePlaidSandbox: true,
      })

      expect(lastPlaidLinkOptions().env).toBeUndefined()
    })

    it('stops linking when the customer callback rejects', async () => {
      const { result } = await renderPlaidLinkModal({
        customerManagedPlaidConfig: makeCustomerManagedPlaidConfig({
          onPublicTokenReceived: vi.fn(() => Promise.reject(new Error('customer backend is down'))),
        }),
      })

      await completePlaidLink()

      await waitFor(() => expect(result.current.isLinking).toBe(false))
    })

    it('stops linking when the customer callback throws synchronously', async () => {
      const { result } = await renderPlaidLinkModal({
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

  describe('without a customer-managed Plaid config', () => {
    it('exchanges the public token with Layer', async () => {
      const exchangePlaidPublicToken = spyOnEndpoint(postExchangePlaidPublicToken)

      await renderPlaidLinkModal()

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
      await renderPlaidLinkModal({ usePlaidSandbox: true })

      expect(lastPlaidLinkOptions().env).toBe('sandbox')
    })
  })

  describe('the outcome a Link session resolves', () => {
    it('resolves true once the connection is saved and clears the token', async () => {
      const { session } = await renderPlaidLinkModal()
      expect(lastPlaidLinkOptions().token).toBe('a-link-token')

      await completePlaidLink()

      await expect(session).resolves.toBe(true)
      expect(lastPlaidLinkOptions().token).toBeNull()
    })

    it('ignores the exit Plaid sends after a successful Link while the token is still being saved', async () => {
      const { session } = await renderPlaidLinkModal()
      const { onExit: exitFinishedLink } = lastPlaidLinkOptions()

      await completePlaidLink()
      await exitPlaidLink(null, exitFinishedLink)

      await expect(session).resolves.toBe(true)
    })

    it('resolves false when Link closes', async () => {
      const { session } = await renderPlaidLinkModal()

      await exitPlaidLink()

      await expect(session).resolves.toBe(false)
      expect(lastPlaidLinkOptions().token).toBeNull()
    })

    it('resolves false when the public token couldn’t be saved', async () => {
      const { session } = await renderPlaidLinkModal({
        customerManagedPlaidConfig: makeCustomerManagedPlaidConfig({
          onPublicTokenReceived: vi.fn(() => Promise.reject(new Error('customer backend is down'))),
        }),
      })

      await completePlaidLink()

      await expect(session).resolves.toBe(false)
    })

    it('resolves false when Plaid fails to load after the session started', async () => {
      const { session, rerender } = await renderPlaidLinkModal()

      mockPlaidLink(new ErrorEvent('error'))
      rerender()

      await expect(session).resolves.toBe(false)
      expect(lastPlaidLinkOptions().token).toBeNull()
    })

    it('turns away a second session while one is open', async () => {
      const { result } = await renderPlaidLinkModal()

      await expect(result.current.openLink('another-token', 'add')).resolves.toBe(false)
      expect(lastPlaidLinkOptions().token).toBe('a-link-token')
    })
  })

  describe('Link outcomes reported to the API and emitted as events', () => {
    it('reports and emits a completed Link session', async () => {
      const reportOutcome = spyOnEndpoint(postPlaidLinkOutcome)
      const onEvent = vi.fn<(event: LayerEvent) => void>()

      await renderPlaidLinkModal({ onEvent })

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

      await renderPlaidLinkModal({ mode: 'update', onEvent })

      await exitPlaidLink()

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
    })

    it('reports the Plaid error code and emits the Link error', async () => {
      const reportOutcome = spyOnEndpoint(postPlaidLinkOutcome)
      const onEvent = vi.fn<(event: LayerEvent) => void>()

      await renderPlaidLinkModal({ mode: 'update', onEvent })

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

      await renderPlaidLinkModal({ onEvent })

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
})

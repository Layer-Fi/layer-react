import { act, waitFor } from '@testing-library/react'
import { type PlaidLinkOnSuccessMetadata, type PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { PlaidHostedLinkState } from '@schemas/features/linkedAccounts/plaidHostedLinkStatus'
import { useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { get as getBookkeepingPeriods } from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { get as getPlaidHostedLinkStatus } from '@msw/api/businesses/[business-id]/plaid/hosted-link/get'
import { post as postSandboxResetPlaidItemLogin } from '@msw/api/businesses/[business-id]/plaid/items/[plaid-item-id]/sandbox-reset-item-login/post'
import { post as postUnlinkPlaidItem } from '@msw/api/businesses/[business-id]/plaid/items/[plaid-item-id]/unlink/post'
import { post as postPlaidLinkExchange } from '@msw/api/businesses/[business-id]/plaid/link/exchange/post'
import { post as postPlaidLink } from '@msw/api/businesses/[business-id]/plaid/link/post'
import { post as postPlaidUpdateModeLink } from '@msw/api/businesses/[business-id]/plaid/update-mode-link/post'
import { server } from '@msw/node'
import { makeCustomerManagedPlaidConfig } from '@testUtils/mocks/customerManagedPlaidConfig'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'
import { spyOnEndpoint } from '@testUtils/requests/spyOnEndpoint'

// `ready: false` keeps the hook from auto-opening the widget.
vi.mock('react-plaid-link', () => ({
  usePlaidLink: vi.fn(() => ({ open: vi.fn(), ready: false })),
}))

const lastPlaidLinkOptions = () => vi.mocked(usePlaidLink).mock.lastCall?.[0] as PlaidLinkOptions

// `connectionExternalId` is the Plaid item id for a Layer-managed connection and the processor
// token for a customer-managed one, so each suite passes the id its mode would really carry.
const PLAID_ITEM_ID = 'plaid-item-id'
const PROCESSOR_TOKEN = 'processor-sandbox-0a1b2c3d-4e5f'

const renderLinkedAccounts = (customerManagedPlaidConfig?: CustomerManagedPlaidConfig) =>
  renderHookWithAuth(() => useLinkedAccounts({ customerManagedPlaidConfig }))

const linkThroughPlaid = async (addConnection: ReturnType<typeof useLinkedAccounts>['addConnection']) => {
  const connection = addConnection('PLAID')
  await waitFor(() => expect(lastPlaidLinkOptions().token).toEqual(expect.any(String)))
  act(() => {
    lastPlaidLinkOptions().onSuccess('public-token', { institution: null } as PlaidLinkOnSuccessMetadata)
  })

  return connection
}

const spyOnBookkeepingPeriods = () => {
  server.use(getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })))
  const onRequest = vi.fn()
  server.use(getBookkeepingPeriods.mock([], { onRequest }))

  return onRequest
}

// BusinessProvider's periods poller fetches once on mount, before any link.
const waitForInitialPeriodsRequest = (onPeriodsRequest: ReturnType<typeof spyOnBookkeepingPeriods>) =>
  waitFor(() => expect(onPeriodsRequest).toHaveBeenCalledOnce())

afterEach(() => vi.restoreAllMocks())

describe('useLinkedAccounts', () => {
  describe('with a customer-managed Plaid config', () => {
    it('mints the add-flow link token through the customer, not Layer', async () => {
      const createPlaidLink = spyOnEndpoint(postPlaidLink)
      const customerManagedPlaidConfig = makeCustomerManagedPlaidConfig()

      const { result } = await renderLinkedAccounts(customerManagedPlaidConfig)

      void result.current.addConnection('PLAID')

      await waitFor(() => expect(customerManagedPlaidConfig.createLinkToken).toHaveBeenCalledOnce())
      expect(createPlaidLink).not.toHaveBeenCalled()
    })

    it('mints the repair link token through the customer, passing the connection id', async () => {
      const createPlaidUpdateModeLink = spyOnEndpoint(postPlaidUpdateModeLink)
      const customerManagedPlaidConfig = makeCustomerManagedPlaidConfig()

      const { result } = await renderLinkedAccounts(customerManagedPlaidConfig)

      void result.current.repairConnection('PLAID', PROCESSOR_TOKEN)

      await waitFor(() => expect(customerManagedPlaidConfig.createUpdateModeLinkToken).toHaveBeenCalledWith(PROCESSOR_TOKEN))
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

  describe('without a customer-managed Plaid config', () => {
    it('still mints the add-flow link token through Layer', async () => {
      const createPlaidLink = spyOnEndpoint(postPlaidLink)

      const { result } = await renderLinkedAccounts()

      void result.current.addConnection('PLAID')

      await waitFor(() => expect(createPlaidLink).toHaveBeenCalledOnce())
    })

    it('still mints the repair link token through Layer', async () => {
      const createPlaidUpdateModeLink = spyOnEndpoint(postPlaidUpdateModeLink)

      const { result } = await renderLinkedAccounts()

      void result.current.repairConnection('PLAID', PLAID_ITEM_ID)

      await waitFor(() => expect(createPlaidUpdateModeLink).toHaveBeenCalledWith(
        expect.objectContaining({ body: { plaid_item_id: PLAID_ITEM_ID } }),
      ))
    })

    it('still unlinks the item through Layer', async () => {
      const unlinkPlaidItem = spyOnEndpoint(postUnlinkPlaidItem)

      const { result } = await renderLinkedAccounts()

      await result.current.removeConnection('PLAID', PLAID_ITEM_ID)

      expect(unlinkPlaidItem).toHaveBeenCalledOnce()
    })
  })

  describe('the outcome addConnection resolves', () => {
    it('resolves true once the new item is saved', async () => {
      const { result } = await renderLinkedAccounts()

      await expect(linkThroughPlaid(result.current.addConnection)).resolves.toBe(true)
    })

    it('resolves false when the link token can’t be minted', async () => {
      server.use(postPlaidLink.mockError({ error: 'unavailable' }))
      const { result } = await renderLinkedAccounts()

      await expect(result.current.addConnection('PLAID')).resolves.toBe(false)
    })
  })

  describe('refreshing tasks after a link', () => {
    it('refetches bookkeeping periods once a Layer-managed link is saved', async () => {
      const onPeriodsRequest = spyOnBookkeepingPeriods()
      const { result } = await renderLinkedAccounts()
      await waitForInitialPeriodsRequest(onPeriodsRequest)

      await expect(linkThroughPlaid(result.current.addConnection)).resolves.toBe(true)

      await waitFor(() => expect(onPeriodsRequest).toHaveBeenCalledTimes(2))
    })

    it('refetches bookkeeping periods once a customer-managed link is saved', async () => {
      const onPeriodsRequest = spyOnBookkeepingPeriods()
      const { result } = await renderLinkedAccounts(makeCustomerManagedPlaidConfig())
      await waitForInitialPeriodsRequest(onPeriodsRequest)

      await expect(linkThroughPlaid(result.current.addConnection)).resolves.toBe(true)

      await waitFor(() => expect(onPeriodsRequest).toHaveBeenCalledTimes(2))
    })

    it('refetches bookkeeping periods once a hosted link succeeds', async () => {
      const onPeriodsRequest = spyOnBookkeepingPeriods()
      server.use(getPlaidHostedLinkStatus.mock({ state: PlaidHostedLinkState.PROCESSING }))
      await renderHookWithAuth(() => useLinkedAccounts({ plaidHostedLinkConfig: { navigateToHostedLink: () => undefined } }))
      await waitForInitialPeriodsRequest(onPeriodsRequest)

      server.use(getPlaidHostedLinkStatus.mock({ state: PlaidHostedLinkState.SUCCEEDED }))

      await waitFor(() => expect(onPeriodsRequest).toHaveBeenCalledTimes(2), { timeout: 5_000 })
    })

    it('does not refetch bookkeeping periods when the link fails to save', async () => {
      const onPeriodsRequest = spyOnBookkeepingPeriods()
      server.use(postPlaidLinkExchange.mockError({ error: 'unavailable' }))
      const { result } = await renderLinkedAccounts()
      await waitForInitialPeriodsRequest(onPeriodsRequest)

      await expect(linkThroughPlaid(result.current.addConnection)).resolves.toBe(false)

      expect(onPeriodsRequest).toHaveBeenCalledOnce()
    })
  })
})

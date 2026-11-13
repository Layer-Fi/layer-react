import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LinkedAccounts, type LinkedAccountsProps } from '@features/linkedAccounts/LinkedAccounts/LinkedAccounts'

import { makeBankAccount } from '@fixtures/bankAccounts/mocks'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { post as postPlaidUpdateModeLink } from '@msw/api/businesses/[business-id]/plaid/update-mode-link/post'
import { server } from '@msw/node'
import { NOW } from '@testUtils/dates/fixedDates'
import { getCallArgs } from '@testUtils/mocks/getCallArgs'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'
import { spyOnEndpoint } from '@testUtils/requests/spyOnEndpoint'

vi.mock('react-plaid-link', () => ({
  usePlaidLink: () => ({ open: () => undefined, ready: false }),
}))

const BROKEN_ACCOUNTS = [
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000202',
  '00000000-0000-4000-8000-000000000203',
  '00000000-0000-4000-8000-000000000204',
].map((id, index) => makeBankAccount({
  id,
  externalAccounts: [{
    ...makeBankAccount().externalAccounts[0]!,
    updateType: index === 3 ? 'USER_PRESENT_REQUIRED' : 'BACKGROUND',
    connectionExternalId: index < 2 ? 'shared-connection' : id,
    connectionNeedsRepairAsOf: NOW,
    lastSyncedAt: NOW,
  }],
}))

const renderLinkedAccounts = (props: Partial<LinkedAccountsProps> = {}) => {
  const user = userEvent.setup()
  const repairRequest = spyOnEndpoint(postPlaidUpdateModeLink)
  server.use(getBankAccounts.mock(BROKEN_ACCOUNTS))

  return {
    user,
    repairRequest,
    ...render(<LinkedAccounts {...props} />, { wrapper: LayerTestProvider }),
  }
}

describe(LinkedAccounts, () => {
  it('offers one repair per broken background connection and respects refresh presentation', async () => {
    const { user, repairRequest, rerender } = renderLinkedAccounts()
    const banners = await screen.findAllByRole('alert')

    expect(banners).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Reconnect' })).toHaveLength(2)

    await user.click(within(banners[0]!).getByRole('button', { name: 'Reconnect' }))

    await waitFor(() => expect(repairRequest).toHaveBeenCalled())
    const [record] = getCallArgs(repairRequest)
    expect(record.body).toEqual({ plaid_item_id: 'shared-connection' })

    rerender(<LinkedAccounts showRepairAsRefresh />)

    expect(screen.queryByRole('button', { name: 'Reconnect' })).not.toBeInTheDocument()
    expect(await screen.findAllByRole('button', { name: 'Refresh now' })).toHaveLength(4)
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LinkedAccounts, type LinkedAccountsProps } from '@features/linkedAccounts/LinkedAccounts/LinkedAccounts'

import { makeBankAccount } from '@fixtures/bankAccounts/mocks'
import { put as assignPcMsoOwner } from '@msw/api/businesses/[business-id]/bank-accounts/[bank-account-id]/pc-mso-owner/put'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
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
  it('lets each account on the same feed keep its own owner or skip assignment', async () => {
    const user = userEvent.setup()
    const request = spyOnEndpoint(assignPcMsoOwner)
    const checking = makeBankAccount({ notifications: [{ type: 'PC_MSO_OWNER_MISSING' }] })
    const savings = makeBankAccount({
      id: '00000000-0000-4000-8000-000000000202',
      accountName: 'Chase Reserve Savings',
      externalAccounts: [{ ...checking.externalAccounts[0]!, id: '00000000-0000-4000-8000-000000000203' }],
      pcMsoOwner: 'PC',
    })
    bankAccountStore.all().forEach(({ id }) => bankAccountStore.deleteById(id))
    bankAccountStore.save(checking)
    bankAccountStore.save(savings)
    render(<LinkedAccounts />, { wrapper: LayerTestProvider })

    const assign = await screen.findByRole('button', { name: 'Owner missing · Assign' })
    expect(screen.getByText('Owner: PC')).toBeVisible()
    await user.click(assign)
    expect(screen.getByRole('button', { name: 'Save owner' })).toBeDisabled()
    expect(screen.getAllByRole('radio').every(radio => !(radio as HTMLInputElement).checked)).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Do this later' }))
    expect(request).not.toHaveBeenCalled()

    await user.click(assign)
    await user.click(screen.getByRole('radio', { name: /MSO/ }))
    await user.click(screen.getByRole('button', { name: 'Save owner' }))
    expect(await screen.findByText('Owner: MSO')).toBeVisible()
    expect(screen.getByText('Owner: PC')).toBeVisible()
    expect(getCallArgs(request).map(record => record.body)).toEqual([{ owner: 'MSO' }])
  })

  it('summarizes disconnected background accounts and reconnects from each card', async () => {
    const { user, repairRequest, rerender } = renderLinkedAccounts()
    const banner = await screen.findByRole('alert')

    expect(banner).toHaveTextContent(/^3 accounts at .+ are disconnected/)
    const reconnectButtons = screen.getAllByRole('button', { name: /^Reconnect/ })
    expect(reconnectButtons).toHaveLength(3)

    await user.click(reconnectButtons[0]!)

    await waitFor(() => expect(repairRequest).toHaveBeenCalled())
    const [record] = getCallArgs(repairRequest)
    expect(record.body).toEqual({ plaid_item_id: 'shared-connection' })

    rerender(<LinkedAccounts showRepairAsRefresh />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Reconnect/ })).not.toBeInTheDocument()
    expect(await screen.findAllByRole('button', { name: 'Refresh now' })).toHaveLength(4)
  })
})

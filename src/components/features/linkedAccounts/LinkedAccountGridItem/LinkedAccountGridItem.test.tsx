import { type PropsWithChildren } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GridList } from 'react-aria-components/GridList'
import { describe, expect, it, vi } from 'vitest'

import { LinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsProvider'
import { LinkedAccountGridItem, type LinkedAccountGridItemProps } from '@features/linkedAccounts/LinkedAccountGridItem/LinkedAccountGridItem'

import { makeBankAccount } from '@fixtures/bankAccounts/mocks'
import { post as postPlaidUpdateModeLink } from '@msw/api/businesses/[business-id]/plaid/update-mode-link/post'
import { NOW } from '@testUtils/dates/fixedDates'
import { getCallArgs } from '@testUtils/mocks/getCallArgs'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'
import { spyOnEndpoint } from '@testUtils/requests/spyOnEndpoint'

vi.mock('react-plaid-link', () => ({
  usePlaidLink: () => ({ open: () => undefined, ready: false }),
}))

const PLAID_ACCOUNT_MISSING_OPENING_BALANCE = makeBankAccount({
  notifications: [{ type: 'OPENING_BALANCE_MISSING' }],
})

const CUSTOM_ACCOUNT_MISSING_OPENING_BALANCE = makeBankAccount({
  notifications: [{ type: 'OPENING_BALANCE_MISSING' }],
  externalAccounts: PLAID_ACCOUNT_MISSING_OPENING_BALANCE.externalAccounts.map(externalAccount => ({
    ...externalAccount,
    externalAccountSource: 'CUSTOM',
    userCreated: true,
    connectionExternalId: null,
  })),
})

const BROKEN_PLAID_ACCOUNT = makeBankAccount({
  externalAccounts: [{
    ...makeBankAccount().externalAccounts[0]!,
    updateType: 'BACKGROUND',
    lastSyncedAt: NOW,
    connectionNeedsRepairAsOf: NOW,
  }],
})

const GridListWrapper = ({ children }: PropsWithChildren) => (
  <LayerTestProvider>
    <LinkedAccountsProvider>
      <GridList aria-label='Linked accounts'>{children}</GridList>
    </LinkedAccountsProvider>
  </LayerTestProvider>
)

const renderGridItem = (props: LinkedAccountGridItemProps) => {
  const user = userEvent.setup()
  const repairRequest = spyOnEndpoint(postPlaidUpdateModeLink)

  return {
    user,
    repairRequest,
    ...render(<LinkedAccountGridItem {...props} />, { wrapper: GridListWrapper }),
  }
}

describe(LinkedAccountGridItem, () => {
  it('offers to add an opening balance for a non-Plaid account missing one', async () => {
    const { user } = renderGridItem({ account: CUSTOM_ACCOUNT_MISSING_OPENING_BALANCE })

    await user.click(await screen.findByRole('button', { name: 'Account options' }))

    expect(await screen.findByRole('menuitem', { name: 'Add opening balance' })).toBeInTheDocument()
  })

  it('does not offer to add an opening balance for a Plaid account missing one', async () => {
    const { user } = renderGridItem({ account: PLAID_ACCOUNT_MISSING_OPENING_BALANCE })

    await user.click(await screen.findByRole('button', { name: 'Account options' }))

    expect(await screen.findByRole('menu')).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Add opening balance' })).not.toBeInTheDocument()
  })

  it('shows a red fix pill for a broken connection by default', async () => {
    renderGridItem({ account: BROKEN_PLAID_ACCOUNT })

    expect(await screen.findByRole('button', { name: 'Fix account' })).toHaveAttribute('data-variant', 'error')
    expect(screen.queryByRole('button', { name: 'Refresh now' })).not.toBeInTheDocument()
  })

  it('presents a broken connection as a green refresh pill that still repairs it', async () => {
    const { user, repairRequest } = renderGridItem({ account: BROKEN_PLAID_ACCOUNT, showRepairAsRefresh: true })

    const refreshPill = await screen.findByRole('button', { name: 'Refresh now' })
    expect(refreshPill).toHaveAttribute('data-variant', 'success')
    expect(screen.queryByRole('button', { name: 'Fix account' })).not.toBeInTheDocument()

    await user.click(refreshPill)

    await waitFor(() => expect(repairRequest).toHaveBeenCalled())
    const [record] = getCallArgs(repairRequest)
    expect(record.body).toEqual({ plaid_item_id: 'plaid_connection_4821' })
  })
})

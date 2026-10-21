import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { BankTransactions } from '@features/bankTransactions/BankTransactions/BankTransactions'
import { BankTransactionsWithLinkedAccounts } from '@views/BankTransactionsWithLinkedAccounts/BankTransactionsWithLinkedAccounts'

import { makeBankAccount } from '@fixtures/bankAccounts/mocks'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { post as postPlaidUpdateModeLink } from '@msw/api/businesses/[business-id]/plaid/update-mode-link/post'
import { server } from '@msw/node'
import { NOW } from '@testUtils/dates/fixedDates'
import { getCallArgs } from '@testUtils/mocks/getCallArgs'
import { LayerTestProvider, TEST_LAYER_BUSINESS_ID } from '@testUtils/render/LayerTestProvider'
import { spyOnEndpoint } from '@testUtils/requests/spyOnEndpoint'

vi.mock('react-plaid-link', () => ({
  usePlaidLink: () => ({ open: () => undefined, ready: false }),
}))

const brokenAccount = makeBankAccount({
  externalAccounts: [{
    ...makeBankAccount().externalAccounts[0]!,
    updateType: 'BACKGROUND',
    lastSyncedAt: NOW,
    connectionNeedsRepairAsOf: NOW,
  }],
})

const renderTransactions = (
  Component: typeof BankTransactions | typeof BankTransactionsWithLinkedAccounts,
  bankAccounts = [brokenAccount],
) => {
  const user = userEvent.setup()
  const request = spyOnEndpoint(postPlaidUpdateModeLink)

  server.use(getBankAccounts.mock(bankAccounts))

  return {
    user,
    request,
    ...render(<Component showConnectionRepairAlert />, { wrapper: LayerTestProvider }),
  }
}

describe('bank transaction connection actions', () => {
  it.each([
    { name: 'BankTransactions', Component: BankTransactions },
    { name: 'BankTransactionsWithLinkedAccounts', Component: BankTransactionsWithLinkedAccounts },
  ])('opts in and starts a repair through $name', async ({ Component }) => {
    const { user, request, rerender } = renderTransactions(Component)
    const buttonName = 'Refresh 1 bank connection to see recent transactions'

    expect(await screen.findByRole('button', { name: buttonName })).toBeInTheDocument()

    rerender(<Component />)
    expect(screen.queryByRole('region', { name: 'Bank connections require attention' })).not.toBeInTheDocument()

    rerender(<Component showConnectionRepairAlert />)
    await user.click(await screen.findByRole('button', { name: buttonName }))

    await waitFor(() => expect(request).toHaveBeenCalled())
    const [record] = getCallArgs(request)
    expect(record.params.businessId).toBe(TEST_LAYER_BUSINESS_ID)
    expect(record.body).toEqual({ plaid_item_id: 'plaid_connection_4821' })
  })

  it('customizes account button labels and colors without changing the repair action', async () => {
    const refreshAccount = makeBankAccount({
      id: '00000000-0000-4000-8000-000000000201',
      externalAccounts: [{
        ...makeBankAccount().externalAccounts[0]!,
        id: '00000000-0000-4000-8000-000000000202',
        connectionExternalId: 'plaid_connection_refresh',
        updateType: 'USER_PRESENT_REQUIRED',
      }],
    })
    const { user, request, rerender } = renderTransactions(BankTransactionsWithLinkedAccounts, [brokenAccount, refreshAccount])

    expect(await screen.findByRole('button', { name: 'Fix account' })).toHaveAttribute('data-variant', 'error')
    expect(screen.getByRole('button', { name: 'Refresh Now' })).toHaveAttribute('data-variant', 'success')

    rerender(
      <BankTransactionsWithLinkedAccounts
        stringOverrides={{ linkedAccounts: { fixAccountButtonText: 'Refresh Now', refreshNowButtonText: 'Update bank' } }}
        slotProps={{ FixAccountButton: { status: 'success' } }}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Fix account' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refresh Now' })).toHaveAttribute('data-variant', 'success')
    expect(screen.getByRole('button', { name: 'Update bank' })).toHaveAttribute('data-variant', 'success')

    rerender(
      <BankTransactionsWithLinkedAccounts
        stringOverrides={{ linkedAccounts: { fixAccountButtonText: 'Refresh Now', refreshNowButtonText: 'Update bank' } }}
        slotProps={{ FixAccountButton: { status: 'success' }, RefreshNowButton: { status: 'error' } }}
      />,
    )
    expect(screen.getByRole('button', { name: 'Refresh Now' })).toHaveAttribute('data-variant', 'success')
    expect(screen.getByRole('button', { name: 'Update bank' })).toHaveAttribute('data-variant', 'error')

    await user.click(screen.getByRole('button', { name: 'Refresh Now' }))
    await waitFor(() => expect(request).toHaveBeenCalled())
    const [record] = getCallArgs(request)
    expect(record.body).toEqual({ plaid_item_id: 'plaid_connection_4821' })
  })
})

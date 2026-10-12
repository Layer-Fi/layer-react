import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { AccountConfirmationStoreProvider } from '@providers/features/linkedAccounts/AccountConfirmationStore/AccountConfirmationStoreProvider'
import { PendingAccountConfirmationBanner } from '@features/linkedAccounts/PendingAccountConfirmationBanner/PendingAccountConfirmationBanner'

import { makeAccountNeedingConfirmation, makeBankAccountWithMirroredExternalAccount } from '@fixtures/bankAccounts/mocks'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { server } from '@msw/node'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const plaidCd = {
  id: '00000000-0000-4000-8000-0000000000c1',
  externalAccountId: '00000000-0000-4000-8000-0000000000e1',
  name: 'Plaid CD',
  institution: 'Chase',
  mask: '2222',
  balance: 100000,
}
const plaidChecking = {
  id: '00000000-0000-4000-8000-0000000000c2',
  externalAccountId: '00000000-0000-4000-8000-0000000000e2',
  name: 'Plaid Checking',
  institution: 'Chase',
  mask: '0000',
  balance: 11000,
}

let refetchAccounts: () => Promise<unknown> = () => Promise.resolve()

const CaptureRefetchAccounts = () => {
  refetchAccounts = useBankAccountsContext().refetch
  return null
}

const renderBanner = () => ({
  user: userEvent.setup(),
  ...render(
    <AccountConfirmationStoreProvider>
      <PendingAccountConfirmationBanner />
      <CaptureRefetchAccounts />
    </AccountConfirmationStoreProvider>,
    { wrapper: LayerTestProvider },
  ),
})

describe('PendingAccountConfirmationBanner', () => {
  it('asks to confirm the accounts waiting for confirmation', async () => {
    server.use(getBankAccounts.mock([makeAccountNeedingConfirmation(plaidCd), makeBankAccountWithMirroredExternalAccount(plaidChecking)]))
    renderBanner()

    expect(await screen.findByText('Confirm your new account')).toBeInTheDocument()
    expect(screen.getByText(/We found 1 new account\./)).toBeInTheDocument()
  })

  it('opens the confirmation modal only when asked', async () => {
    server.use(getBankAccounts.mock([makeAccountNeedingConfirmation(plaidCd), makeAccountNeedingConfirmation(plaidChecking)]))
    const { user } = renderBanner()

    await screen.findByText('Confirm your new accounts')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Review accounts' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Plaid CD')
    expect(dialog).toHaveTextContent('Plaid Checking')
  })

  it('does not reopen the modal for accounts that arrive after the last ones were confirmed elsewhere', async () => {
    server.use(getBankAccounts.mock([makeAccountNeedingConfirmation(plaidCd)]))
    const { user } = renderBanner()
    await user.click(await screen.findByRole('button', { name: 'Review accounts' }))
    await screen.findByRole('dialog')

    server.use(getBankAccounts.mock([makeBankAccountWithMirroredExternalAccount(plaidCd)]))
    await act(() => refetchAccounts())
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    server.use(getBankAccounts.mock([makeBankAccountWithMirroredExternalAccount(plaidCd), makeAccountNeedingConfirmation(plaidChecking)]))
    await act(() => refetchAccounts())

    expect(await screen.findByText('Confirm your new account')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows nothing when every account is confirmed', async () => {
    let requests = 0
    server.use(getBankAccounts.mock([makeBankAccountWithMirroredExternalAccount(plaidChecking)], {
      onRequest: () => {
        requests += 1
      },
    }))
    renderBanner()

    await waitFor(() => expect(requests).toBeGreaterThan(0))
    expect(screen.queryByText(/Confirm your new account/)).not.toBeInTheDocument()
  })
})

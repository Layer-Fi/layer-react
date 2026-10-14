import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PendingAccountConfirmationBanner } from '@features/linkedAccounts/PendingAccountConfirmationBanner/PendingAccountConfirmationBanner'

import { makeAccountNeedingConfirmation, makeBankAccountWithMirroredExternalAccount } from '@fixtures/bankAccounts/mocks'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { server } from '@msw/node'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const PLAID_CD = {
  id: '00000000-0000-4000-8000-0000000000c1',
  externalAccountId: '00000000-0000-4000-8000-0000000000e1',
  name: 'Plaid CD',
  institution: 'Chase',
  mask: '2222',
  balance: 100000,
}
const PLAID_CHECKING = {
  id: '00000000-0000-4000-8000-0000000000c2',
  externalAccountId: '00000000-0000-4000-8000-0000000000e2',
  name: 'Plaid Checking',
  institution: 'Chase',
  mask: '0000',
  balance: 11000,
}

const renderBanner = () => ({
  user: userEvent.setup(),
  ...render(<PendingAccountConfirmationBanner />, { wrapper: LayerTestProvider }),
})

describe('PendingAccountConfirmationBanner', () => {
  it('counts the accounts waiting for confirmation and opens the dialog from Review accounts', async () => {
    server.use(getBankAccounts.mock([makeAccountNeedingConfirmation(PLAID_CD), makeAccountNeedingConfirmation(PLAID_CHECKING)]))
    const { user } = renderBanner()

    expect(await screen.findByText('Confirm your new accounts')).toBeInTheDocument()
    expect(screen.getByText(/We found 2 new accounts\./)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Review accounts' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Plaid CD')
    expect(dialog).toHaveTextContent('Plaid Checking')
  })

  it('shows nothing when every account is confirmed', async () => {
    const onRequest = vi.fn()
    server.use(getBankAccounts.mock([makeBankAccountWithMirroredExternalAccount(PLAID_CHECKING)], { onRequest }))
    renderBanner()

    await waitFor(() => expect(onRequest).toHaveBeenCalled())
    expect(screen.queryByText(/Confirm your new account/)).not.toBeInTheDocument()
  })
})

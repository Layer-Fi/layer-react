import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AccountConfirmationStoreProvider } from '@providers/features/linkedAccounts/AccountConfirmationStore/AccountConfirmationStoreProvider'
import { BookkeepingOverview } from '@views/BookkeepingOverview/BookkeepingOverview'

import { makeAccountNeedingConfirmation, makeBankAccountWithMirroredExternalAccount } from '@fixtures/bankAccounts/mocks'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { server } from '@msw/node'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const PLAID_CHECKING = {
  id: '00000000-0000-4000-8000-0000000000c2',
  externalAccountId: '00000000-0000-4000-8000-0000000000e2',
  name: 'Plaid Checking',
  institution: 'Chase',
  mask: '0000',
  balance: 11000,
}

const renderOverview = () => render(<BookkeepingOverview />, { wrapper: LayerTestProvider })

describe('BookkeepingOverview', () => {
  it('opens the confirmation dialog as soon as an account needs confirmation', async () => {
    server.use(getBankAccounts.mock([makeAccountNeedingConfirmation(PLAID_CHECKING)]))
    renderOverview()

    const dialog = await screen.findByRole('dialog', { name: 'Confirm Accounts' })
    expect(dialog).toHaveTextContent('Plaid Checking')
  })

  it('keeps the confirmation dialog closed when every account is confirmed', async () => {
    const onRequest = vi.fn()
    server.use(getBankAccounts.mock([makeBankAccountWithMirroredExternalAccount(PLAID_CHECKING)], { onRequest }))
    renderOverview()

    await waitFor(() => expect(onRequest).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('leaves account confirmation to the host when it already provides the confirmation store', async () => {
    const onRequest = vi.fn()
    server.use(getBankAccounts.mock([makeAccountNeedingConfirmation(PLAID_CHECKING)], { onRequest }))
    render(
      <AccountConfirmationStoreProvider>
        <BookkeepingOverview />
      </AccountConfirmationStoreProvider>,
      { wrapper: LayerTestProvider },
    )

    await waitFor(() => expect(onRequest).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

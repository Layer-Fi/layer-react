import { type PropsWithChildren } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GridList } from 'react-aria-components/GridList'
import { describe, expect, it } from 'vitest'

import { type BankAccount } from '@schemas/features/bankAccounts/bankAccount'
import { LinkedAccountGridItem } from '@features/linkedAccounts/LinkedAccountGridItem/LinkedAccountGridItem'

import { makeBankAccount } from '@fixtures/bankAccounts/mocks'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

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

const GridListWrapper = ({ children }: PropsWithChildren) => (
  <LayerTestProvider>
    <GridList aria-label='Linked accounts'>{children}</GridList>
  </LayerTestProvider>
)

const renderGridItem = async (account: BankAccount) => {
  const user = userEvent.setup()

  const result = render(<LinkedAccountGridItem account={account} />, { wrapper: GridListWrapper })

  await user.click(await screen.findByRole('button', { name: 'Account options' }))

  return { user, ...result }
}

describe(LinkedAccountGridItem, () => {
  it('offers to add an opening balance for a non-Plaid account missing one', async () => {
    await renderGridItem(CUSTOM_ACCOUNT_MISSING_OPENING_BALANCE)

    expect(await screen.findByRole('menuitem', { name: 'Add opening balance' })).toBeInTheDocument()
  })

  it('does not offer to add an opening balance for a Plaid account missing one', async () => {
    await renderGridItem(PLAID_ACCOUNT_MISSING_OPENING_BALANCE)

    expect(await screen.findByRole('menu')).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Add opening balance' })).not.toBeInTheDocument()
  })
})

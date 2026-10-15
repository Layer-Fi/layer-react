import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PendingAccountConfirmationBanner } from '@features/linkedAccounts/PendingAccountConfirmationBanner/PendingAccountConfirmationBanner'

import { makeAccountNeedingConfirmation } from '@fixtures/bankAccounts/mocks'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { server } from '@msw/node'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const PLAID_SANDBOX_ACCOUNT_NAMES = [
  'Plaid Checking',
  'Plaid Saving',
  'Plaid CD',
  'Plaid Credit Card',
  'Plaid Money Market',
  'Plaid IRA',
  'Plaid 401k',
  'Plaid Student Loan',
]

const PLAID_SANDBOX_ACCOUNTS = PLAID_SANDBOX_ACCOUNT_NAMES.map((name, index) => makeAccountNeedingConfirmation({
  id: `00000000-0000-4000-8000-0000000000c${index}`,
  externalAccountId: `00000000-0000-4000-8000-0000000000e${index}`,
  name,
  institution: 'Chase',
  mask: `000${index}`,
  balance: 10000,
}))

const renderConfirmationModal = async () => {
  server.use(getBankAccounts.mock(PLAID_SANDBOX_ACCOUNTS))
  const user = userEvent.setup()
  const result = render(<PendingAccountConfirmationBanner />, { wrapper: LayerTestProvider })

  await user.click(await screen.findByRole('button', { name: 'Review accounts' }))
  const dialog = await screen.findByRole('dialog')

  return { user, dialog, ...result }
}

const getInclusionCheckbox = (dialog: HTMLElement, accountName: string) => {
  const checkbox = within(dialog).getAllByRole('checkbox', { name: 'Confirm Account Inclusion' })[PLAID_SANDBOX_ACCOUNT_NAMES.indexOf(accountName)]
  if (!checkbox) throw new Error(`No inclusion checkbox for ${accountName}`)
  return checkbox
}

describe('LinkedAccountsConfirmationModal', () => {
  it('keeps each toggled row mounted and focused so the scrolled list stays in place', async () => {
    const { user, dialog } = await renderConfirmationModal()
    const plaid401k = getInclusionCheckbox(dialog, 'Plaid 401k')
    const plaidStudentLoan = getInclusionCheckbox(dialog, 'Plaid Student Loan')

    await user.click(plaid401k)

    expect(plaid401k).toBeInTheDocument()
    expect(plaid401k).toHaveFocus()
    expect(plaid401k).not.toBeChecked()

    await user.click(plaidStudentLoan)

    expect(plaidStudentLoan).toBeInTheDocument()
    expect(plaidStudentLoan).toHaveFocus()
    expect(plaidStudentLoan).not.toBeChecked()
    expect(within(dialog).getByRole('button', { name: 'Connect 6 Accounts' })).toBeInTheDocument()
  })
})

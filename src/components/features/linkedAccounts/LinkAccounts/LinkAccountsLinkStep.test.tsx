import { useContext, useMemo, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { LinkedAccountsContext } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'
import { LinkAccountsLinkStep } from '@features/linkedAccounts/LinkAccounts/LinkAccountsLinkStep'

import { makeBankAccountWithMirroredExternalAccount } from '@fixtures/bankAccounts/mocks'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { server } from '@msw/node'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const PLAID_CHECKING = makeBankAccountWithMirroredExternalAccount({
  id: '00000000-0000-4000-8000-0000000000c2',
  externalAccountId: '00000000-0000-4000-8000-0000000000e2',
  name: 'Plaid Checking',
  institution: 'Chase',
  mask: '0000',
  balance: 11000,
})

function LinkAccountsLinkStepWithLinking() {
  const linkedAccounts = useContext(LinkedAccountsContext)
  const [isLinking, setIsLinking] = useState(false)
  const value = useMemo(() => ({
    ...linkedAccounts,
    isLinking,
    addConnection: () => {
      setIsLinking(true)
      return Promise.resolve(true)
    },
  }), [isLinking, linkedAccounts])

  return (
    <LinkedAccountsContext.Provider value={value}>
      <LinkAccountsLinkStep />
    </LinkedAccountsContext.Provider>
  )
}

const renderLinkAccountsLinkStep = () => {
  server.use(getBankAccounts.mock([PLAID_CHECKING]))

  return {
    user: userEvent.setup(),
    ...render(<LinkAccountsLinkStepWithLinking />, { wrapper: LayerTestProvider }),
  }
}

describe('LinkAccountsLinkStep', () => {
  it('keeps the linked account list mounted when linking another bank starts', async () => {
    const { user } = renderLinkAccountsLinkStep()
    const linkAnotherBank = await screen.findByRole('button', { name: 'Link another bank' })
    const accountName = screen.getByText('Plaid Checking')

    await user.click(linkAnotherBank)

    expect(linkAnotherBank).toBeInTheDocument()
    expect(linkAnotherBank).toBeDisabled()
    expect(accountName).toBeInTheDocument()
  })
})

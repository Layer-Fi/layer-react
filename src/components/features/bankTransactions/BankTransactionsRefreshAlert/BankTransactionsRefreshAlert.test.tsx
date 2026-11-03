import { type ComponentProps, type PropsWithChildren } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { BankTransactionsFeatureVisibilityProvider } from '@providers/features/bankTransactions/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { BankTransactionsRefreshAlert } from '@features/bankTransactions/BankTransactionsRefreshAlert/BankTransactionsRefreshAlert'

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

const BROKEN_ACCOUNT = makeBankAccount({
  externalAccounts: [{
    ...makeBankAccount().externalAccounts[0]!,
    updateType: 'BACKGROUND',
    lastSyncedAt: NOW,
    connectionNeedsRepairAsOf: NOW,
  }],
})

type Flags = Omit<ComponentProps<typeof BankTransactionsFeatureVisibilityProvider>, 'children'>

const renderRefreshAlert = (flags: Flags = {}) => {
  const user = userEvent.setup()
  const bankAccountsRequest = vi.fn()
  const repairRequest = spyOnEndpoint(postPlaidUpdateModeLink)

  server.use(getBankAccounts.mock([BROKEN_ACCOUNT], { onRequest: bankAccountsRequest }))

  const Wrapper = ({ children }: PropsWithChildren) => (
    <LayerTestProvider>
      <BankTransactionsFeatureVisibilityProvider {...flags}>
        {children}
      </BankTransactionsFeatureVisibilityProvider>
    </LayerTestProvider>
  )

  return {
    user,
    bankAccountsRequest,
    repairRequest,
    ...render(<BankTransactionsRefreshAlert />, { wrapper: Wrapper }),
  }
}

describe(BankTransactionsRefreshAlert, () => {
  it('renders nothing unless the connection alert is enabled', async () => {
    const { bankAccountsRequest } = renderRefreshAlert()

    await waitFor(() => expect(bankAccountsRequest).toHaveBeenCalled())
    expect(screen.queryByRole('region', { name: 'Bank connections require attention' })).not.toBeInTheDocument()
  })

  it('lists a broken connection with fix copy and starts a repair', async () => {
    const { user, repairRequest } = renderRefreshAlert({ showConnectionAlert: true })

    const fixAction = await screen.findByRole('button', { name: 'Fix 1 bank connection to see recent transactions' })
    expect(screen.getByRole('region', { name: 'Bank connections require attention' })).toHaveAttribute('data-status', 'error')

    await user.click(fixAction)

    await waitFor(() => expect(repairRequest).toHaveBeenCalled())
    const [record] = getCallArgs(repairRequest)
    expect(record.params.businessId).toBe(TEST_LAYER_BUSINESS_ID)
    expect(record.body).toEqual({ plaid_item_id: 'plaid_connection_4821' })
  })

  it('presents a broken connection as a refresh when configured', async () => {
    renderRefreshAlert({ showConnectionAlert: true, showRepairAsRefresh: true })

    expect(await screen.findByRole('button', { name: 'Refresh 1 bank connection to see recent transactions' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Bank connections require attention' })).toHaveAttribute('data-status', 'success')
  })
})

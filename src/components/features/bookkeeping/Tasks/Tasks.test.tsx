import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'
import { Tasks } from '@features/bookkeeping/Tasks/Tasks'

import { makeCustomerManagedPlaidConfig } from '@testUtils/mocks/customerManagedPlaidConfig'
import { makeLinkedAccountsContext } from '@testUtils/mocks/linkedAccountsContext'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

vi.mock('@hooks/legacy/useLinkedAccounts', () => ({ useLinkedAccounts: vi.fn() }))

const mockedUseLinkedAccounts = vi.mocked(useLinkedAccounts)

const renderTasks = (ui: React.ReactElement) => {
  mockedUseLinkedAccounts.mockReset()
  mockedUseLinkedAccounts.mockImplementation(() => makeLinkedAccountsContext())
  return render(ui, { wrapper: LayerTestProvider })
}

describe('Tasks Plaid settings', () => {
  it('connects accounts through a customer-managed Plaid config', () => {
    const customerManagedPlaidConfig = makeCustomerManagedPlaidConfig()

    renderTasks(<Tasks customerManagedPlaidConfig={customerManagedPlaidConfig} />)

    expect(mockedUseLinkedAccounts).toHaveBeenCalledWith(expect.objectContaining({ customerManagedPlaidConfig }))
  })
})

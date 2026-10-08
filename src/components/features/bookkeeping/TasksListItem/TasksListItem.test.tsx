import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { TasksListItem } from '@features/bookkeeping/TasksListItem/TasksListItem'

import { bankTransactionCategories } from '@fixtures/bankTransactions/constants'
import { makeCounterpartyTask } from '@fixtures/bookkeeping/unifiedAskFormTasks/counterparty'
import { askTransactions, fixtureId } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const renderItem = () => {
  const task = makeCounterpartyTask({
    id: fixtureId('901'),
    counterparty: 'Costco',
    suggestions: [bankTransactionCategories.officeExpenses, bankTransactionCategories.meals],
    transactions: askTransactions(1, [{ id: 'a01', day: 14, amount: -30774, description: 'COSTCO WHSE #1042' }]),
  }) as UserVisibleTask

  return {
    user: userEvent.setup(),
    ...render(<TasksListItem task={task} defaultOpen />, { wrapper: LayerTestProvider }),
  }
}

describe('TasksListItem', () => {
  it('keeps the card expanded when the header back button is pressed', async () => {
    const { user } = renderItem()

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByRole('radio', { name: /Something else/ })).toBeInTheDocument()
  })

  it('still collapses when the header itself is clicked', async () => {
    const { user } = renderItem()

    await user.click(screen.getByText('Costco purchases'))

    expect(screen.queryByRole('radio', { name: 'Business Meals' })).not.toBeInTheDocument()
  })
})

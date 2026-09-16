import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { TasksListItem } from '@features/bookkeeping/TasksListItem/TasksListItem'

import { makeCounterpartyAskTask } from '@fixtures/bookkeeping/counterpartyAskTasks'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const renderItem = () => {
  const task = makeCounterpartyAskTask() as UserVisibleTask

  return {
    user: userEvent.setup(),
    ...render(<TasksListItem task={task} defaultOpen />, { wrapper: LayerTestProvider }),
  }
}

const expandedBody = () => document.querySelector('.Layer__tasks-list-item__body--expanded')

describe('TasksListItem', () => {
  it('keeps the card expanded when the header back button is pressed', async () => {
    const { user } = renderItem()

    expect(expandedBody()).not.toBeNull()

    await user.click(screen.getByRole('radio', { name: 'Business Meals' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByRole('radio', { name: /Something else/ })).toBeInTheDocument()
    expect(expandedBody()).not.toBeNull()
  })

  it('still collapses when the header itself is clicked', async () => {
    const { user } = renderItem()

    await user.click(screen.getByText('Costco purchases'))

    expect(expandedBody()).toBeNull()
  })
})
